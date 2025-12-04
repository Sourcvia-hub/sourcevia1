# SharePoint Schema Package for Sourcevia Procurement Management System

This package contains SharePoint-compatible schemas for all modules in the Sourcevia system.

## 📦 Package Contents

1. **Excel Templates** (`/excel_templates/`) - Ready-to-import Excel files for each SharePoint list
2. **JSON Schemas** (`/json_schemas/`) - Structured JSON definitions for SharePoint list creation via API
3. **Field Definitions** (`FIELD_DEFINITIONS.md`) - Complete field reference documentation

## 📊 Modules Included

1. **Users** - User accounts and authentication
2. **Vendors** - Vendor registration with due diligence questionnaires
3. **Tenders** - Tender management and invitations
4. **Proposals** - Vendor proposal submissions and evaluations
5. **Contracts** - Contract management with outsourcing assessments
6. **Purchase Orders** - PO creation with risk assessments
7. **Invoices** - Invoice tracking and milestone verification
8. **Resources** - Resource/contractor management
9. **Assets** - Asset and facilities management
10. **Buildings** - Building master data
11. **Floors** - Floor master data
12. **Asset Categories** - Asset category master data
13. **OSR** (Operational Service Requests) - Service request management
14. **Notifications** - System notifications
15. **Audit Logs** - System audit trail

## 🔄 Migration Strategy

### Phase 1: SharePoint List Creation
Use the JSON schemas or Excel templates to create SharePoint lists for each module.

### Phase 2: Data Migration
Export existing data from MongoDB and import into SharePoint using:
- SharePoint REST API
- Power Automate
- CSV Import (for Excel templates)

### Phase 3: Backend Integration
The backend has been refactored with a Repository pattern:
- Replace `JSONRepository` with `SharePointRepository`
- No changes needed to business logic or API endpoints
- See `/app/backend/repositories/` for implementation

## 📝 SharePoint List Configuration

### Column Types Mapping

| Python Type | SharePoint Column Type |
|------------|----------------------|
| str | Single line of text |
| Optional[str] | Single line of text (not required) |
| int, float | Number |
| bool | Yes/No |
| datetime | Date and Time |
| List[str] | Multiple lines of text (JSON) |
| List[Dict] | Multiple lines of text (JSON) |
| Dict | Multiple lines of text (JSON) |
| Enum | Choice |

### Special Considerations

1. **File Attachments**: Use SharePoint Document Libraries linked to main lists
2. **Relationships**: Use Lookup columns (e.g., vendor_id → Vendors list)
3. **JSON Fields**: Store as multiline text, parse in application layer
4. **Auto-numbering**: Use SharePoint calculated columns or workflows

## 🚀 Quick Start

### Option 1: Manual Import (Excel)
1. Download Excel templates from `/excel_templates/`
2. Go to SharePoint site
3. Create new list from each Excel file
4. Configure column types as specified in templates

### Option 2: PowerShell Script
```powershell
# Use the JSON schemas with PnP PowerShell
Connect-PnPOnline -Url "https://yourtenant.sharepoint.com/sites/sourcevia"
New-PnPList -Title "Vendors" -Template GenericList
# Add columns from JSON schema
```

### Option 3: REST API
```javascript
// Use SharePoint REST API with JSON schemas
// See /json_schemas/ for field definitions
```

## 📞 Support

For questions or issues with SharePoint integration:
1. Review FIELD_DEFINITIONS.md for detailed field descriptions
2. Check JSON schemas for exact SharePoint column configuration
3. Test with Excel templates first for quick validation

---

**Generated**: December 2024  
**Version**: 1.0  
**System**: Sourcevia Procurement Management
