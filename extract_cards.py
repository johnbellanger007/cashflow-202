import os
import glob
import json
import time
from io import BytesIO
try:
    from PIL import Image
    import pillow_heif
    from google import genai
    from google.genai import types
except ImportError:
    print("Missing dependencies. Run: pip install pillow pillow-heif google-genai pydantic")
    exit(1)

from pydantic import BaseModel, Field

# Helper function to read env var
# Usage: GEMINI_API_KEY="your-key" python extract_cards.py
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY environment variable not set.")
    exit(1)

client = genai.Client(api_key=api_key)

# The folders to scan and their corresponding JSON keys
FOLDERS = {
    "Cash_flow_202_The_Market": "market",
    "../Cashflow_202_Dreams": "dreams"
}

# Define the expected schema for the Gemini response using Pydantic
class CardSchema(BaseModel):
    title: str
    description: str
    cost: int = Field(description="numeric purchase cost or doodad expense, 0 if NA")
    downPayment: int = Field(description="numeric down payment if applicable, 0 if NA")
    cashflow: int = Field(description="numeric monthly cashflow, 0 if NA")
    assetType: str = Field(description="e.g. 'stock', 'real_estate', 'business', 'coin', 'NA'")
    symbol: str = Field(description="stock ticker symbol if applicable, e.g. 'OK4U', 'MYT4U'. Empty if NA")
    roi_percent: int = Field(description="ROI percentage if applicable", default=0)
    marketOffer: int = Field(description="purchase offer from market cards, 0 if NA", default=0)
    targetAssetType: str = Field(description="asset type requested by market card, e.g. '3Br/2Ba', 'plex', 'business'", default="")

PROMPTS = {
    "deal": "Extract the data from this Cashflow 202 Small Deal or Big Deal card. Extract title, description, cost, down payment, cash flow, symbol, ROI, and asset type ('stock', 'real_estate', 'business'). Convert textual numbers into integers.",
    "capital_gain_deal": "Extract data from this Cashflow 202 Capital Gain Deal. It might be options or shorting or typical assets. Extract title, desc, cost, down payment, symbol if any, options pricing rules if applicable in description.",
    "market": "Extract data from this Cashflow 202 The Market card. Extract the title, description. Determine what asset type the buyer wants (targetAssetType) and what their numeric offer is (marketOffer).",
    "dreams": "Extract data from this Cashflow 202 Dream card. Extract the title, description, and the numeric cost."
}

database = {}

def process_image(filepath, category):
    print(f"Processing ({category}): {os.path.basename(filepath)}")
    try:
        # Register HEIF opener
        pillow_heif.register_heif_opener()
        # Open image
        img = Image.open(filepath)
        # Convert to JPEG bytes to pass to Gemini
        img = img.convert("RGB")
        byte_arr = BytesIO()
        img.save(byte_arr, format='JPEG')
        
        system_prompt = PROMPTS.get(category, "Extract card data")
        
        # We pass PIL image directly, genai sdk handles it
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                system_prompt,
                img
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=CardSchema,
                temperature=0.1
            )
        )
        
        return json.loads(response.text)
    except Exception as e:
        print(f"Failed to process {filepath}: {e}")
        return None

# Load existing database to append if exists
output_file = "js/cards_data.js"
if os.path.exists(output_file):
    with open(output_file, 'r', encoding='utf-8') as f:
        content = f.read()
        if content.startswith("const EXTERNAL_CARDS = "):
            content = content.replace("const EXTERNAL_CARDS = ", "").strip()
            if content.endswith(";"):
                content = content[:-1]
            database = json.loads(content)

for folder, category in FOLDERS.items():
    if category not in database:
        database[category] = []
        
    files = []
    files.extend(glob.glob(os.path.join(folder, "*.HEIC")))
    files.extend(glob.glob(os.path.join(folder, "*.JPG")))
    files.extend(glob.glob(os.path.join(folder, "*.jpg")))

    files.sort()
    
    # Get existing files for this category to avoid re-extracting if not needed
    existing_in_category = set(card.get("_source_file") for card in database[category] if card.get("_source_file"))
    
    print(f"Found {len(files)} files in {folder}. {len(existing_in_category)} already correctly processed.")
    
    for f in files: 
        base_f = os.path.basename(f)
        if base_f in existing_in_category:
            continue
            
        card_data = process_image(f, category)
        if card_data:
            card_data["_source_file"] = base_f
            database[category].append(card_data)
            
            with open(output_file, 'w', encoding='utf-8') as pf:
                pf.write("const EXTERNAL_CARDS = ")
                json.dump(database, pf, indent=4, ensure_ascii=False)
                pf.write(";\n")
                
        time.sleep(4) # rate limiting buffer for free tier

with open(output_file, 'w', encoding='utf-8') as f:
    f.write("const EXTERNAL_CARDS = ")
    json.dump(database, f, indent=4, ensure_ascii=False)
    f.write(";")
    
print(f"Successfully wrote data to {output_file}")
