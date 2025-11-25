"""
General helper functions
"""
from datetime import datetime, timezone


async def generate_number(entity_type: str) -> str:
    """
    Generate sequential number for entities in format: {Type}-{YY}-{NNNN}
    Examples: Vendor-25-0001, Tender-25-0002, Contract-25-0001
    """
    current_year = datetime.now(timezone.utc).year
    year_suffix = str(current_year)[-2:]  # Last 2 digits of year
    
    # Get or create counter for this entity type and year
    counter_id = f"{entity_type}_{current_year}"
    
    # Use findOneAndUpdate with upsert to atomically increment
    result = await db.counters.find_one_and_update(
        {"_id": counter_id},
        {"$inc": {"sequence": 1}},
        upsert=True,
        return_document=True
    )
    
    sequence = result.get("sequence", 1)
    
    # Format: Type-YY-NNNN (e.g., Vendor-25-0001)
    return f"{entity_type}-{year_suffix}-{sequence:04d}"


def determine_outsourcing_classification(contract_data: dict) -> str:
    """
    Determine outsourcing classification based on Section A questionnaire responses.
    
    Priority order:
    1. If A5 = YES → "cloud_computing"
    2. If any A4 checkbox = YES → "exempted"
    3. If A3 = YES → "insourcing"
    4. If A1 = YES AND A2 = YES → "outsourcing"
    5. If all Section A = NO → "not_outsourcing"
    """
    # Priority 1: Cloud Computing (overrides everything)
    if contract_data.get('a5_cloud_hosted') is True:
        return "cloud_computing"
    
    # Priority 2: Exempted (any A4 checkbox is True)
    if (contract_data.get('a4_market_data_providers') is True or
        contract_data.get('a4_clearing_settlement') is True or
        contract_data.get('a4_correspondent_banking') is True or
        contract_data.get('a4_utilities') is True):
        return "exempted"
    
    # Priority 3: Insourcing (overrides A1 and A2)
    if contract_data.get('a3_is_insourcing_contract') is True:
        return "insourcing"
    
    # Priority 4: Outsourcing (A1 AND A2 both YES)
    if (contract_data.get('a1_continuing_basis') is True and
        contract_data.get('a2_could_be_undertaken_by_bank') is True):
        return "outsourcing"
    
    # Default: Not outsourcing
    return "not_outsourcing"


def determine_noc_requirement(contract_data: dict, vendor_type: str) -> bool:
    """
    Determine if NOC (No Objection Certificate) is required for a contract.
    
    NOC required when:
    1. Outsourcing contract with ANY yes on Section B assessment, OR
    2. Cloud computing contract, OR  
    3. Outsourcing contract with international vendor only
    """
    classification = contract_data.get('outsourcing_classification', '')
    
    # Check if cloud computing - always requires NOC
    if classification == 'cloud_computing':
        return True
    
    # For outsourcing contracts
    if classification == 'outsourcing':
        # Check if vendor is international
        if vendor_type == 'international':
            return True
        
        # Check Section B - if ANY B question is True, requires NOC
        if (contract_data.get('b1_data_processing') is True or
            contract_data.get('b2_technology_infra') is True or
            contract_data.get('b3_regulatory_compliance') is True or
            contract_data.get('b4_customer_interaction') is True or
            contract_data.get('b5_payment_systems') is True or
            contract_data.get('b6_internal_audit') is True or
            contract_data.get('b7_treasury_trading') is True):
            return True
    
    return False
