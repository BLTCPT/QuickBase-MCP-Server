import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Tool parameter schemas
const TableIdSchema = z.object({
  tableId: z.string().describe('QuickBase table ID (e.g., "bu65pc8px")')
});

const RecordIdSchema = z.object({
  tableId: z.string().describe('QuickBase table ID'),
  recordId: z.number().describe('Record ID number')
});

const CreateTableSchema = z.object({
  name: z.string().describe('Table name'),
  description: z.string().optional().describe('Table description')
});

const CreateFieldSchema = z.object({
  tableId: z.string().describe('Table ID to add field to'),
  label: z.string().describe('Field label/name'),
  fieldType: z.enum([
    'text', 'text_choice', 'text_multiline', 'richtext', 'numeric', 
    'currency', 'percent', 'date', 'datetime', 'checkbox', 'email', 
    'phone', 'url', 'address', 'file', 'lookup', 'formula', 'reference'
  ]).describe('Type of field'),
  required: z.boolean().default(false).describe('Whether field is required'),
  unique: z.boolean().default(false).describe('Whether field must be unique'),
  choices: z.array(z.string()).optional().describe('Choices for choice fields'),
  formula: z.string().optional().describe('Formula for formula fields'),
  lookupTableId: z.string().optional().describe('Table ID for lookup fields'),
  lookupFieldId: z.number().optional().describe('Field ID for lookup fields')
});

const QueryRecordsSchema = z.object({
  tableId: z.string().describe('Table ID to query'),
  select: z.array(z.number()).optional().describe('Field IDs to select'),
  where: z.string().optional().describe('QuickBase query filter'),
  sortBy: z.array(z.object({
    fieldId: z.number(),
    order: z.enum(['ASC', 'DESC']).default('ASC')
  })).optional().describe('Sort criteria'),
  top: z.number().optional().describe('Max number of records'),
  skip: z.number().optional().describe('Number of records to skip')
});

const CreateRecordSchema = z.object({
  tableId: z.string().describe('Table ID to create record in'),
  fields: z.record(z.any()).describe('Field values as fieldId: value pairs')
});

const UpdateRecordSchema = z.object({
  tableId: z.string().describe('Table ID'),
  recordId: z.number().describe('Record ID to update'),
  fields: z.record(z.any()).describe('Field values to update as fieldId: value pairs')
});

const BulkCreateSchema = z.object({
  tableId: z.string().describe('Table ID'),
  records: z.array(z.object({
    fields: z.record(z.any())
  })).describe('Array of records to create')
});

const SearchRecordsSchema = z.object({
  tableId: z.string().describe('Table ID to search'),
  searchTerm: z.string().describe('Text to search for'),
  fieldIds: z.array(z.number()).optional().describe('Field IDs to search in')
});

const CreateRelationshipSchema = z.object({
  parentTableId: z.string().describe('Parent table ID'),
  childTableId: z.string().describe('Child table ID'),
  foreignKeyFieldId: z.number().describe('Foreign key field ID in child table')
});

const CreateAdvancedRelationshipSchema = z.object({
  parentTableId: z.string().describe('Parent table ID'),
  childTableId: z.string().describe('Child table ID'),
  referenceFieldLabel: z.string().describe('Label for the reference field to create'),
  lookupFields: z.array(z.object({
    parentFieldId: z.number().describe('Field ID in parent table to lookup'),
    childFieldLabel: z.string().describe('Label for lookup field in child table')
  })).optional().describe('Lookup fields to create automatically'),
  relationshipType: z.enum(['one-to-many', 'many-to-many']).default('one-to-many').describe('Type of relationship')
});

const CreateLookupFieldSchema = z.object({
  childTableId: z.string().describe('Child table ID where lookup field will be created'),
  parentTableId: z.string().describe('Parent table ID to lookup from'),
  referenceFieldId: z.number().describe('Reference field ID in child table'),
  parentFieldId: z.number().describe('Field ID in parent table to lookup'),
  lookupFieldLabel: z.string().describe('Label for the new lookup field')
});

const ValidateRelationshipSchema = z.object({
  parentTableId: z.string().describe('Parent table ID'),
  childTableId: z.string().describe('Child table ID'),
  foreignKeyFieldId: z.number().describe('Foreign key field ID to validate')
});

// Codepage management schemas
const SaveCodepageSchema = z.object({
  tableId: z.string().describe('Table ID for storing codepages'),
  name: z.string().describe('Name of the codepage'),
  code: z.string().describe('JavaScript code for the codepage'),
  description: z.string().optional().describe('Description of the codepage')
});

const GetCodepageSchema = z.object({
  tableId: z.string().describe('Table ID where codepages are stored'),
  recordId: z.number().describe('Record ID of the codepage')
});

const ListCodepagesSchema = z.object({
  tableId: z.string().describe('Table ID where codepages are stored'),
  limit: z.number().optional().describe('Maximum number of codepages to return')
});

const ExecuteCodepageSchema = z.object({
  tableId: z.string().describe('Table ID where codepages are stored'),
  recordId: z.number().describe('Record ID of the codepage'),
  functionName: z.string().describe('Name of the function to execute'),
  parameters: z.record(z.any()).optional().describe('Parameters to pass to the function')
});

// Auth schemas
const InitiateOAuthSchema = z.object({
  clientId: z.string().describe('OAuth client ID'),
  redirectUri: z.string().describe('Redirect URI for OAuth'),
  scopes: z.array(z.string()).optional().describe('OAuth scopes')
});

// Define all MCP tools
export const quickbaseTools: Tool[] = [
  // ========== APPLICATION TOOLS ==========
  {
    name: 'quickbase_get_app_info',
    description: 'Get information about the QuickBase application',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },

  {
    name: 'quickbase_get_tables',
    description: 'Get list of all tables in the application',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },

  {
    name: 'quickbase_test_connection',
    description: 'Test connection to QuickBase',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },

  // ========== TABLE TOOLS ==========
  {
    name: 'quickbase_create_table',
    description: 'Create a new table in QuickBase',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Table name' },
        description: { type: 'string', description: 'Table description' }
      },
      required: ['name']
    }
  },

  {
    name: 'quickbase_get_table_info',
    description: 'Get detailed information about a specific table',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'QuickBase table ID' }
      },
      required: ['tableId']
    }
  },

  {
    name: 'quickbase_delete_table',
    description: 'Delete a table from QuickBase',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'QuickBase table ID to delete' }
      },
      required: ['tableId']
    }
  },

  // ========== FIELD TOOLS ==========
  {
    name: 'quickbase_get_table_fields',
    description: 'Get all fields for a table',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'QuickBase table ID' }
      },
      required: ['tableId']
    }
  },

  {
    name: 'quickbase_create_field',
    description: 'Create a new field in a table',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID to add field to' },
        label: { type: 'string', description: 'Field label/name' },
        fieldType: { 
          type: 'string',
          enum: ['text', 'text_choice', 'text_multiline', 'richtext', 'numeric', 'currency', 'percent', 'date', 'datetime', 'checkbox', 'email', 'phone', 'url', 'address', 'file', 'lookup', 'formula', 'reference'],
          description: 'Type of field'
        },
        required: { type: 'boolean', description: 'Whether field is required', default: false },
        unique: { type: 'boolean', description: 'Whether field must be unique', default: false },
        choices: { type: 'array', items: { type: 'string' }, description: 'Choices for choice fields' },
        formula: { type: 'string', description: 'Formula for formula fields' },
        lookupTableId: { type: 'string', description: 'Table ID for lookup fields' },
        lookupFieldId: { type: 'number', description: 'Field ID for lookup fields' }
      },
      required: ['tableId', 'label', 'fieldType']
    }
  },

  {
    name: 'quickbase_update_field',
    description: 'Update an existing field',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID' },
        fieldId: { type: 'number', description: 'Field ID to update' },
        label: { type: 'string', description: 'New field label' },
        required: { type: 'boolean', description: 'Whether field is required' },
        choices: { type: 'array', items: { type: 'string' }, description: 'New choices for choice fields' }
      },
      required: ['tableId', 'fieldId']
    }
  },

  {
    name: 'quickbase_delete_field',
    description: 'Delete a field from a table',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID' },
        fieldId: { type: 'number', description: 'Field ID to delete' }
      },
      required: ['tableId', 'fieldId']
    }
  },

  // ========== RECORD TOOLS ==========
  {
    name: 'quickbase_query_records',
    description: 'Query records from a table with optional filtering and sorting',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID to query' },
        select: { type: 'array', items: { type: 'number' }, description: 'Field IDs to select' },
        where: { type: 'string', description: 'QuickBase query filter (e.g., "{6.EX.\'John\'}")' },
        sortBy: { 
          type: 'array', 
          items: {
            type: 'object',
            properties: {
              fieldId: { type: 'number' },
              order: { type: 'string', enum: ['ASC', 'DESC'] }
            }
          },
          description: 'Sort criteria'
        },
        top: { type: 'number', description: 'Max number of records' },
        skip: { type: 'number', description: 'Number of records to skip' }
      },
      required: ['tableId']
    }
  },

  {
    name: 'quickbase_get_record',
    description: 'Get a specific record by ID',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID' },
        recordId: { type: 'number', description: 'Record ID' },
        fieldIds: { type: 'array', items: { type: 'number' }, description: 'Specific field IDs to retrieve' }
      },
      required: ['tableId', 'recordId']
    }
  },

  {
    name: 'quickbase_create_record',
    description: 'Create a new record in a table',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID to create record in' },
        fields: { 
          type: 'object', 
          description: 'Field values as fieldId: {value: actualValue} pairs',
          additionalProperties: true
        }
      },
      required: ['tableId', 'fields']
    }
  },

  {
    name: 'quickbase_update_record',
    description: 'Update an existing record',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID' },
        recordId: { type: 'number', description: 'Record ID to update' },
        fields: { 
          type: 'object', 
          description: 'Field values to update as fieldId: {value: actualValue} pairs',
          additionalProperties: true
        }
      },
      required: ['tableId', 'recordId', 'fields']
    }
  },

  {
    name: 'quickbase_delete_record',
    description: 'Delete a record from a table',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID' },
        recordId: { type: 'number', description: 'Record ID to delete' }
      },
      required: ['tableId', 'recordId']
    }
  },

  {
    name: 'quickbase_bulk_create_records',
    description: 'Create multiple records at once',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID' },
        records: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              fields: { type: 'object', additionalProperties: true }
            }
          },
          description: 'Array of records to create'
        }
      },
      required: ['tableId', 'records']
    }
  },

  {
    name: 'quickbase_search_records',
    description: 'Search for records containing specific text',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID to search' },
        searchTerm: { type: 'string', description: 'Text to search for' },
        fieldIds: { type: 'array', items: { type: 'number' }, description: 'Field IDs to search in' }
      },
      required: ['tableId', 'searchTerm']
    }
  },

  // ========== RELATIONSHIP TOOLS ==========
  {
    name: 'quickbase_create_relationship',
    description: 'Create a parent-child relationship between tables',
    inputSchema: {
      type: 'object',
      properties: {
        parentTableId: { type: 'string', description: 'Parent table ID' },
        childTableId: { type: 'string', description: 'Child table ID' },
        foreignKeyFieldId: { type: 'number', description: 'Foreign key field ID in child table' }
      },
      required: ['parentTableId', 'childTableId', 'foreignKeyFieldId']
    }
  },

  {
    name: 'quickbase_get_relationships',
    description: 'Get relationships for a table',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID' }
      },
      required: ['tableId']
    }
  },

  // ========== UTILITY TOOLS ==========
  {
    name: 'quickbase_get_reports',
    description: 'Get all reports for a table',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID' }
      },
      required: ['tableId']
    }
  },

  {
    name: 'quickbase_run_report',
    description: 'Run a specific report',
    inputSchema: {
      type: 'object',
      properties: {
        reportId: { type: 'string', description: 'Report ID' },
        tableId: { type: 'string', description: 'Table ID' }
      },
      required: ['reportId', 'tableId']
    }
  },

  // ========== ENHANCED RELATIONSHIP TOOLS ==========
  {
    name: 'quickbase_create_advanced_relationship',
    description: 'Create a comprehensive table relationship with automatic lookup fields',
    inputSchema: {
      type: 'object',
      properties: {
        parentTableId: { type: 'string', description: 'Parent table ID' },
        childTableId: { type: 'string', description: 'Child table ID' },
        referenceFieldLabel: { type: 'string', description: 'Label for the reference field to create' },
        lookupFields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              parentFieldId: { type: 'number', description: 'Field ID in parent table to lookup' },
              childFieldLabel: { type: 'string', description: 'Label for lookup field in child table' }
            },
            required: ['parentFieldId', 'childFieldLabel']
          },
          description: 'Lookup fields to create automatically'
        },
        relationshipType: { 
          type: 'string', 
          enum: ['one-to-many', 'many-to-many'], 
          default: 'one-to-many',
          description: 'Type of relationship' 
        }
      },
      required: ['parentTableId', 'childTableId', 'referenceFieldLabel']
    }
  },

  {
    name: 'quickbase_create_lookup_field',
    description: 'Create a lookup field to pull data from a related table',
    inputSchema: {
      type: 'object',
      properties: {
        childTableId: { type: 'string', description: 'Child table ID where lookup field will be created' },
        parentTableId: { type: 'string', description: 'Parent table ID to lookup from' },
        referenceFieldId: { type: 'number', description: 'Reference field ID in child table' },
        parentFieldId: { type: 'number', description: 'Field ID in parent table to lookup' },
        lookupFieldLabel: { type: 'string', description: 'Label for the new lookup field' }
      },
      required: ['childTableId', 'parentTableId', 'referenceFieldId', 'parentFieldId', 'lookupFieldLabel']
    }
  },

  {
    name: 'quickbase_validate_relationship',
    description: 'Validate the integrity of a table relationship',
    inputSchema: {
      type: 'object',
      properties: {
        parentTableId: { type: 'string', description: 'Parent table ID' },
        childTableId: { type: 'string', description: 'Child table ID' },
        foreignKeyFieldId: { type: 'number', description: 'Foreign key field ID to validate' }
      },
      required: ['parentTableId', 'childTableId', 'foreignKeyFieldId']
    }
  },

  {
    name: 'quickbase_get_relationship_details',
    description: 'Get detailed information about table relationships including lookup fields',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID to analyze relationships for' },
        includeFields: { type: 'boolean', default: true, description: 'Include related field details' }
      },
      required: ['tableId']
    }
  },

  {
    name: 'quickbase_create_junction_table',
    description: 'Create a junction table for many-to-many relationships',
    inputSchema: {
      type: 'object',
      properties: {
        junctionTableName: { type: 'string', description: 'Name for the junction table' },
        table1Id: { type: 'string', description: 'First table ID' },
        table2Id: { type: 'string', description: 'Second table ID' },
        table1FieldLabel: { type: 'string', description: 'Label for reference to first table' },
        table2FieldLabel: { type: 'string', description: 'Label for reference to second table' },
        additionalFields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              fieldType: { type: 'string' }
            }
          },
          description: 'Additional fields for the junction table'
        }
      },
      required: ['junctionTableName', 'table1Id', 'table2Id', 'table1FieldLabel', 'table2FieldLabel']
    }
  },

  // ========== CODEPAGE TOOLS ==========
  {
    name: 'quickbase_save_codepage',
    description: 'Save a JavaScript codepage to QuickBase',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID for storing codepages' },
        name: { type: 'string', description: 'Name of the codepage' },
        code: { type: 'string', description: 'JavaScript code for the codepage' },
        description: { type: 'string', description: 'Description of the codepage' }
      },
      required: ['tableId', 'name', 'code']
    }
  },

  {
    name: 'quickbase_get_codepage',
    description: 'Retrieve a codepage from QuickBase',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID where codepages are stored' },
        recordId: { type: 'number', description: 'Record ID of the codepage' }
      },
      required: ['tableId', 'recordId']
    }
  },

  {
    name: 'quickbase_list_codepages',
    description: 'List all codepages in a table',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID where codepages are stored' },
        limit: { type: 'number', description: 'Maximum number of codepages to return' }
      },
      required: ['tableId']
    }
  },

  {
    name: 'quickbase_execute_codepage',
    description: 'Execute a function from a stored codepage',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID where codepages are stored' },
        recordId: { type: 'number', description: 'Record ID of the codepage' },
        functionName: { type: 'string', description: 'Name of the function to execute' },
        parameters: {
          type: 'object',
          description: 'Parameters to pass to the function',
          additionalProperties: true
        }
      },
      required: ['tableId', 'recordId', 'functionName']
    }
  },

  {
    name: 'quickbase_update_codepage',
    description: 'Update an existing codepage with new code, description, version, or active status',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID where codepages are stored' },
        recordId: { type: 'number', description: 'Record ID of the codepage to update' },
        code: { type: 'string', description: 'Updated JavaScript code' },
        description: { type: 'string', description: 'Updated description' },
        version: { type: 'string', description: 'Version number (e.g., "1.2.0")' },
        active: { type: 'boolean', description: 'Whether the codepage is active' }
      },
      required: ['tableId', 'recordId']
    }
  },

  {
    name: 'quickbase_search_codepages',
    description: 'Search for codepages by name, tags, target table, or active status',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID where codepages are stored' },
        name: { type: 'string', description: 'Search by codepage name' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' },
        targetTable: { type: 'string', description: 'Filter by target table ID' },
        active: { type: 'boolean', description: 'Filter by active status' },
        limit: { type: 'number', description: 'Maximum number of results' }
      },
      required: ['tableId']
    }
  },

  {
    name: 'quickbase_clone_codepage',
    description: 'Clone an existing codepage with optional modifications',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID where codepages are stored' },
        recordId: { type: 'number', description: 'Record ID of the codepage to clone' },
        newName: { type: 'string', description: 'Name for the cloned codepage' },
        modifications: {
          type: 'object',
          description: 'Optional modifications to apply to the clone',
          additionalProperties: true
        }
      },
      required: ['tableId', 'recordId', 'newName']
    }
  },

  {
    name: 'quickbase_export_codepage',
    description: 'Export a codepage in HTML, JSON, or Markdown format',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID where codepages are stored' },
        recordId: { type: 'number', description: 'Record ID of the codepage to export' },
        format: {
          type: 'string',
          enum: ['html', 'json', 'markdown'],
          description: 'Export format'
        }
      },
      required: ['tableId', 'recordId', 'format']
    }
  },

  {
    name: 'quickbase_import_codepage',
    description: 'Import a codepage from an external source',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID where codepages are stored' },
        source: { type: 'string', description: 'Source URL or file path' },
        name: { type: 'string', description: 'Name for the imported codepage' },
        format: {
          type: 'string',
          enum: ['html', 'json', 'markdown', 'auto'],
          description: 'Format of the source (auto-detect if not specified)'
        }
      },
      required: ['tableId', 'source', 'name']
    }
  },

  {
    name: 'quickbase_save_codepage_version',
    description: 'Save a version snapshot of a codepage for version control',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID where codepages are stored' },
        recordId: { type: 'number', description: 'Record ID of the codepage' },
        versionNumber: { type: 'string', description: 'Version number (e.g., "1.0.0")' },
        notes: { type: 'string', description: 'Version notes or changelog' }
      },
      required: ['tableId', 'recordId', 'versionNumber']
    }
  },

  {
    name: 'quickbase_get_codepage_versions',
    description: 'Get version history for a codepage',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID where codepages are stored' },
        recordId: { type: 'number', description: 'Record ID of the codepage' },
        limit: { type: 'number', description: 'Maximum number of versions to return' }
      },
      required: ['tableId', 'recordId']
    }
  },

  {
    name: 'quickbase_rollback_codepage',
    description: 'Rollback a codepage to a previous version',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID where codepages are stored' },
        recordId: { type: 'number', description: 'Record ID of the codepage' },
        versionNumber: { type: 'string', description: 'Version number to rollback to' }
      },
      required: ['tableId', 'recordId', 'versionNumber']
    }
  },

  // ========== QUICKBASE CODEPAGE DEPLOYMENT TOOLS ==========
  {
    name: 'quickbase_deploy_codepage',
    description: 'Get deployment instructions for QuickBase built-in codepage (pageID-based). Provides steps and code for manual deployment.',
    inputSchema: {
      type: 'object',
      properties: {
        appId: { type: 'string', description: 'QuickBase application ID (e.g., "bvhuaz7")' },
        pageId: { type: 'number', description: 'Page ID for the codepage (e.g., 2, 3)' },
        code: { type: 'string', description: 'JavaScript code to deploy' },
        pageName: { type: 'string', description: 'Optional name for the codepage' }
      },
      required: ['appId', 'pageId', 'code']
    }
  },

  {
    name: 'quickbase_test_load_codepage',
    description: 'Test if a codepage is accessible and properly deployed by attempting to load it via HTTP',
    inputSchema: {
      type: 'object',
      properties: {
        appId: { type: 'string', description: 'QuickBase application ID' },
        pageId: { type: 'number', description: 'Page ID of the codepage to test' }
      },
      required: ['appId', 'pageId']
    }
  },

  {
    name: 'quickbase_test_codepage_save',
    description: 'Test saving data from a codepage to QuickBase (simulates codepage save operation)',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID to save data to' },
        testData: {
          type: 'object',
          description: 'Test record data in QuickBase format (field IDs as keys)',
          additionalProperties: true
        }
      },
      required: ['tableId', 'testData']
    }
  },

  {
    name: 'quickbase_validate_codepage',
    description: 'Validate codepage code for syntax errors and best practices',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'JavaScript code to validate' }
      },
      required: ['code']
    }
  },

  // ========== CODEPAGE DEVELOPMENT HELPER TOOLS ==========
  {
    name: 'quickbase_get_table_schema',
    description: 'Get full table schema organized for codepage development (user fields, lookups, formulas, field mappings)',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID to get schema for' }
      },
      required: ['tableId']
    }
  },

  {
    name: 'quickbase_generate_field_map',
    description: 'Generate JavaScript field mapping code for a table (creates FIELDS constant with all field IDs)',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID to generate field map for' }
      },
      required: ['tableId']
    }
  },

  {
    name: 'quickbase_get_code_snippet',
    description: 'Get common code snippets for codepage development (session-auth-fetch, create-record, query-records, update-record, delete-record, error-handling)',
    inputSchema: {
      type: 'object',
      properties: {
        snippetName: {
          type: 'string',
          description: 'Name of snippet: session-auth-fetch, create-record, query-records, update-record, delete-record, error-handling'
        }
      },
      required: ['snippetName']
    }
  },

  {
    name: 'quickbase_test_permissions',
    description: 'Test what API operations are allowed for a table (read, create, update, delete, get fields)',
    inputSchema: {
      type: 'object',
      properties: {
        tableId: { type: 'string', description: 'Table ID to test permissions for' }
      },
      required: ['tableId']
    }
  },

  // ========== AUTH TOOLS ==========
  {
    name: 'quickbase_initiate_oauth',
    description: 'Initiate OAuth PKCE flow for QuickBase authentication',
    inputSchema: {
      type: 'object',
      properties: {
        clientId: { type: 'string', description: 'OAuth client ID' },
        redirectUri: { type: 'string', description: 'Redirect URI for OAuth' },
        scopes: { 
          type: 'array', 
          items: { type: 'string' }, 
          description: 'OAuth scopes (e.g., ["read:table", "write:table"])' 
        }
      },
      required: ['clientId', 'redirectUri']
    }
  },
];

// Export schemas for validation
export {
  TableIdSchema,
  RecordIdSchema,
  CreateTableSchema,
  CreateFieldSchema,
  QueryRecordsSchema,
  CreateRecordSchema,
  UpdateRecordSchema,
  BulkCreateSchema,
  SearchRecordsSchema,
  CreateRelationshipSchema,
  CreateAdvancedRelationshipSchema,
  CreateLookupFieldSchema,
  ValidateRelationshipSchema,
  SaveCodepageSchema,
  GetCodepageSchema,
  ListCodepagesSchema,
  ExecuteCodepageSchema,
  InitiateOAuthSchema
}; 