# ProcureFlix SharePoint Integration Guide

## Overview

ProcureFlix supports two data backend modes:
1. **Memory Mode** (default): Uses in-memory data seeded from JSON files for demos and development
2. **SharePoint Mode**: Uses SharePoint Online lists for persistent data storage

The application seamlessly switches between these modes based on configuration, allowing you to:
- Develop and demo locally with in-memory data
- Deploy to production with SharePoint persistence
- Maintain the same API and business logic regardless of backend

## Architecture

### Repository Pattern
The application uses the Repository Pattern with a factory function approach:

```
┌─────────────────┐
│   API Layer     │
│  (routes)       │
└────────┬────────┘
         │
┌────────┴────────┐
│   Service       │
│   Layer         │
└────────┬────────┘
         │
┌────────┴────────────────────┐
│  Repository Factory         │
│  (get_vendor_repository)    │
└────────┬────────────────────┘
         │
    ┌────┴─────┐
    │          │
┌───┴───┐  ┌──┴────────┐
│Memory │  │SharePoint │
│ Repo  │  │   Repo    │
└───────┘  └───────────┘
```

### Supported Modules

The following modules support SharePoint integration in Phase 1:

| Module | SharePoint List | Status |
|--------|----------------|---------|
| Vendors | `Vendors` | ✅ Ready |
| Tenders | `Tenders` | ✅ Ready |
| Proposals | `TenderProposals` | ✅ Ready |
| Contracts | `Contracts` | ✅ Ready |
| Purchase Orders | `PurchaseOrders` | ✅ Ready |
| Invoices | `Invoices` | ✅ Ready |
| Resources | N/A | 🟡 Memory only |
| Service Requests | N/A | 🟡 Memory only |

## Configuration

### Environment Variables

Add these environment variables to enable SharePoint integration:

```bash
# Data backend selection (default: memory)
PROCUREFLIX_DATA_BACKEND=sharepoint  # or "memory"

# SharePoint authentication (App Registration / Client Credentials)
SHAREPOINT_SITE_URL=https://<tenant>.sharepoint.com/sites/<SiteName>
SHAREPOINT_TENANT_ID=<your-azure-ad-tenant-id>
SHAREPOINT_CLIENT_ID=<your-app-registration-client-id>
SHAREPOINT_CLIENT_SECRET=<your-app-registration-client-secret>
```

### Configuration Validation

When `PROCUREFLIX_DATA_BACKEND=sharepoint`, all four SharePoint environment variables are **required**. The application will:
- Validate configuration on startup
- Log clear error messages if any variables are missing
- Return HTTP 500 with a descriptive error message if SharePoint is misconfigured

## SharePoint Setup

### 1. Azure AD App Registration

1. Go to **Azure Portal** → **Azure Active Directory** → **App registrations**
2. Click **New registration**
   - Name: `ProcureFlix API`
   - Supported account types: **Single tenant**
3. After creation, note the following:
   - **Application (client) ID** → `SHAREPOINT_CLIENT_ID`
   - **Directory (tenant) ID** → `SHAREPOINT_TENANT_ID`
4. Go to **Certificates & secrets**
   - Create a new client secret
   - Copy the secret value → `SHAREPOINT_CLIENT_SECRET`

### 2. Grant SharePoint Permissions

1. In the app registration, go to **API permissions**
2. Click **Add a permission** → **SharePoint**
3. Select **Application permissions** (not delegated)
4. Add the following permissions:
   - `Sites.ReadWrite.All` or `Sites.FullControl.All`
5. Click **Grant admin consent** (requires Global Admin or Application Admin role)

### 3. Create SharePoint Lists

Create the following lists in your SharePoint site with the specified columns:

#### Vendors List
```
List Name: Vendors

Required Columns:
- Title (Single line of text) - Company name
- ExternalId (Single line of text) - External unique ID
- VendorNumber (Single line of text)
- CompanyName (Single line of text)
- RegistrationNumber (Single line of text)
- TaxNumber (Single line of text)
- Email (Single line of text)
- Phone (Single line of text)
- Address (Multiple lines of text)
- City (Single line of text)
- State (Single line of text)
- Country (Single line of text)
- PostalCode (Single line of text)
- VendorStatus (Choice: active, inactive, suspended, blacklisted)
- RiskCategory (Choice: low, medium, high)
- RiskScore (Number)
- DueDiligenceRequired (Yes/No)
- DueDiligenceComplete (Yes/No)
```

#### Tenders List
```
List Name: Tenders

Required Columns:
- Title (Single line of text)
- ExternalId (Single line of text)
- TenderNumber (Single line of text)
- Description (Multiple lines of text)
- TenderType (Choice: open, restricted, negotiated)
- Budget (Number)
- Currency (Single line of text)
- DeadlineDate (Date and Time)
- TenderStatus (Choice: draft, published, closed, awarded, cancelled)
- TechnicalWeight (Number)
- FinancialWeight (Number)
```

#### TenderProposals List
```
List Name: TenderProposals

Required Columns:
- Title (Single line of text)
- ExternalId (Single line of text)
- TenderId (Single line of text)
- VendorId (Single line of text)
- ProposalAmount (Number)
- Currency (Single line of text)
- TechnicalScore (Number)
- FinancialScore (Number)
- TotalScore (Number)
- ProposalStatus (Choice: pending, approved, rejected)
```

#### Contracts List
```
List Name: Contracts

Required Columns:
- Title (Single line of text)
- ExternalId (Single line of text)
- ContractNumber (Single line of text)
- VendorId (Single line of text)
- TenderId (Single line of text)
- Description (Multiple lines of text)
- ContractType (Choice: standard, outsourcing, cloud)
- ContractValue (Number)
- Currency (Single line of text)
- StartDate (Date and Time)
- EndDate (Date and Time)
- ContractStatus (Choice: draft, pending_approval, active, expired, terminated)
- RiskCategory (Choice: low, medium, high)
- RiskScore (Number)
```

#### PurchaseOrders List
```
List Name: PurchaseOrders

Required Columns:
- Title (Single line of text) - PO Number
- ExternalId (Single line of text)
- PONumber (Single line of text)
- VendorId (Single line of text)
- ContractId (Single line of text)
- TenderId (Single line of text)
- Description (Multiple lines of text)
- Amount (Number)
- Currency (Single line of text)
- RequestedBy (Single line of text)
- DeliveryLocation (Single line of text)
- POStatus (Choice: draft, pending_approval, approved, issued, cancelled)
```

#### Invoices List
```
List Name: Invoices

Required Columns:
- Title (Single line of text) - Invoice Number
- ExternalId (Single line of text)
- InvoiceNumber (Single line of text)
- VendorId (Single line of text)
- ContractId (Single line of text)
- POId (Single line of text)
- Amount (Number)
- Currency (Single line of text)
- InvoiceDate (Date and Time)
- DueDate (Date and Time)
- InvoiceStatus (Choice: pending, under_review, approved, rejected, paid)
```

### 4. Test Connection

Once everything is configured, test the connection:

```bash
curl http://localhost:8001/api/procureflix/health
```

Expected response with SharePoint mode:
```json
{
  "app": "ProcureFlix",
  "status": "ok",
  "data_backend": "sharepoint",
  "sharepoint_configured": true
}
```

## How It Works

### Authentication Flow

1. Application reads SharePoint credentials from environment variables
2. SharePointClient acquires an OAuth2 access token using **client credentials flow**:
   ```
   POST https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token
   ```
3. Token is cached and automatically refreshed when it expires
4. All SharePoint API requests use the cached access token

### Data Mapping

Each repository implementation includes mapping functions:

- `map_{model}_to_sharepoint(model)` - Converts Pydantic model to SharePoint list item
- `map_sharepoint_to_{model}(item)` - Converts SharePoint list item to Pydantic model

Example:
```python
def map_vendor_to_sharepoint(vendor: Vendor) -> Dict[str, Any]:
    return {
        "Title": vendor.company_name,
        "ExternalId": vendor.id,
        "VendorNumber": vendor.vendor_number,
        # ... more fields
    }
```

### ID Management

- ProcureFlix uses its own `id` field (e.g., `vendor-1`)
- SharePoint has its own auto-increment `Id` field
- We store ProcureFlix IDs in the `ExternalId` field for lookups
- Repositories handle the mapping transparently

## Development Workflow

### Local Development (Memory Mode)

```bash
# Default mode - no SharePoint needed
export PROCUREFLIX_DATA_BACKEND=memory
python server.py
```

The application will:
- Load data from JSON files in `/seed/` directory
- Store data in memory (not persistent)
- Reset data on each restart

### Production Deployment (SharePoint Mode)

```bash
# Configure SharePoint
export PROCUREFLIX_DATA_BACKEND=sharepoint
export SHAREPOINT_SITE_URL="https://contoso.sharepoint.com/sites/ProcureFlix"
export SHAREPOINT_TENANT_ID="your-tenant-id"
export SHAREPOINT_CLIENT_ID="your-client-id"
export SHAREPOINT_CLIENT_SECRET="your-client-secret"

python server.py
```

The application will:
- Connect to SharePoint on startup
- Validate credentials
- Use SharePoint lists for all CRUD operations
- Data persists across restarts

## Error Handling

### Configuration Errors

If SharePoint mode is enabled but credentials are incomplete:

```json
{
  "detail": "SharePoint backend is enabled but configuration is incomplete. Please set all required environment variables: SHAREPOINT_SITE_URL, SHAREPOINT_TENANT_ID, SHAREPOINT_CLIENT_ID, SHAREPOINT_CLIENT_SECRET"
}
```

**Solution**: Verify all four environment variables are set correctly.

### Authentication Errors

If token acquisition fails:

```
SharePointError: Authentication failed: <error details>
```

**Common causes**:
- Invalid client ID or secret
- Incorrect tenant ID
- App registration expired or deleted
- Missing API permissions or admin consent

### API Request Errors

If SharePoint API calls fail:

```
SharePointError: API request failed: <error details>
```

**Common causes**:
- List doesn't exist (check list name spelling)
- Missing required fields in the list
- Insufficient permissions
- Network connectivity issues

## Logging

The SharePoint client and repositories use Python's standard logging:

```python
import logging
logging.basicConfig(level=logging.INFO)
```

Key log messages:
- `"SharePoint access token acquired successfully"` - Authentication succeeded
- `"SharePoint client initialized successfully"` - Client ready
- `"Using SharePoint vendor repository"` - Repository mode selected
- `"Using in-memory vendor repository"` - Memory mode selected

## API Compatibility

The REST API remains **completely unchanged** regardless of backend mode:

```bash
# These endpoints work the same in both modes:
GET    /api/procureflix/vendors
GET    /api/procureflix/vendors/{id}
POST   /api/procureflix/vendors
PATCH  /api/procureflix/vendors/{id}
DELETE /api/procureflix/vendors/{id}
```

Frontend code requires **zero changes** to support SharePoint.

## Limitations & Future Work

### Current Limitations

1. **No bulk seed for SharePoint**: The `bulk_seed()` method is not implemented for SharePoint repositories (use migration scripts instead)
2. **Resources & Service Requests**: Still use in-memory storage
3. **No caching**: Each request hits SharePoint directly (consider adding Redis cache later)
4. **No pagination**: Large lists may be slow (SharePoint has a 5000 item default limit)

### Future Enhancements

- [ ] Implement Redis caching layer for SharePoint data
- [ ] Add batch operations for better performance
- [ ] Implement change tracking (use SharePoint's `Modified` field)
- [ ] Support SharePoint webhooks for real-time updates
- [ ] Add data migration scripts (JSON → SharePoint)
- [ ] Extend Resources & Service Requests to SharePoint
- [ ] Add monitoring and metrics for SharePoint calls

## Troubleshooting

### "401 Unauthorized" Errors

1. Verify app registration exists and client secret hasn't expired
2. Check API permissions include `Sites.ReadWrite.All` or `Sites.FullControl.All`
3. Ensure admin consent was granted
4. Verify tenant ID matches your organization

### "404 Not Found" Errors

1. Check SharePoint site URL is correct (include `/sites/SiteName`)
2. Verify list names match exactly (case-sensitive)
3. Ensure app has access to the site

### "Column not found" Errors

1. Check SharePoint list columns match the schema
2. Verify column internal names (spaces become underscores)
3. Ensure required fields are created

### Data Not Appearing

1. Check `PROCUREFLIX_DATA_BACKEND` is set to `sharepoint`
2. Verify health endpoint shows `"data_backend": "sharepoint"`
3. Check application logs for errors during startup
4. Test SharePoint connection manually using the client

## Support

For SharePoint integration issues:
1. Check application logs for detailed error messages
2. Verify all configuration steps were completed
3. Test SharePoint access using Graph Explorer or Postman
4. Review Azure AD app registration permissions

## Security Best Practices

1. **Never commit credentials**: Use environment variables or Azure Key Vault
2. **Rotate secrets regularly**: Set up automated secret rotation
3. **Principle of least privilege**: Grant only required SharePoint permissions
4. **Monitor access logs**: Review Azure AD sign-in logs regularly
5. **Use managed identities**: Consider Azure Managed Identity for production deployments
