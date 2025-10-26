import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { QuickBaseConfig, QuickBaseField, QuickBaseTable, QuickBaseRecord, QueryOptions } from '../types/quickbase.js';

export class QuickBaseClient {
  private axios: AxiosInstance;
  private config: QuickBaseConfig;

  constructor(config: QuickBaseConfig) {
    this.config = config;
    this.axios = axios.create({
      baseURL: `https://api.quickbase.com/v1`,
      timeout: config.timeout,
      headers: {
        'QB-Realm-Hostname': config.realm,
        'User-Agent': 'QuickBase-MCP-Server/1.0.0',
        'Authorization': `QB-USER-TOKEN ${config.userToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Add request/response interceptors for logging and error handling
    this.axios.interceptors.request.use(
      (config) => {
        console.log(`QB API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axios.interceptors.response.use(
      (response) => {
        console.log(`QB API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`QB API Error: ${error.response?.status} ${error.response?.data?.message || error.message}`);
        return Promise.reject(error);
      }
    );
  }

  // ========== APPLICATION METHODS ==========

  async getAppInfo(): Promise<any> {
    const response = await this.axios.get(`/apps/${this.config.appId}`);
    return response.data;
  }

  async getAppTables(): Promise<any[]> {
    const response = await this.axios.get(`/tables`, {
      params: { appId: this.config.appId }
    });
    return response.data;
  }

  // ========== TABLE METHODS ==========

  async createTable(table: { name: string; description?: string }): Promise<string> {
    const response = await this.axios.post('/tables', {
      appId: this.config.appId,
      name: table.name,
      description: table.description,
      singleRecordName: table.name.slice(0, -1), // Remove 's' for singular
      pluralRecordName: table.name
    });
    return response.data.id;
  }

  async getTableInfo(tableId: string): Promise<any> {
    const response = await this.axios.get(`/tables/${tableId}`, {
      params: { appId: this.config.appId }
    });
    return response.data;
  }

  async updateTable(tableId: string, updates: Partial<QuickBaseTable>): Promise<void> {
    await this.axios.post(`/tables/${tableId}`, {
      appId: this.config.appId,
      ...updates
    });
  }

  async deleteTable(tableId: string): Promise<void> {
    await this.axios.delete(`/tables/${tableId}`, {
      params: { appId: this.config.appId }
    });
  }

  // ========== FIELD METHODS ==========

  async getTableFields(tableId: string): Promise<any[]> {
    const response = await this.axios.get(`/fields`, {
      params: { tableId }
    });
    return response.data;
  }

  async createField(tableId: string, field: QuickBaseField): Promise<number> {
    const fieldData: any = {
      tableId,
      label: field.label,
      fieldType: field.fieldType,
      required: field.required,
      unique: field.unique
    };

    // Add field-specific properties
    if (field.choices && ['text_choice', 'multiselect'].includes(field.fieldType)) {
      fieldData.properties = {
        choices: field.choices
      };
    }

    if (field.formula && field.fieldType === 'formula') {
      fieldData.formula = field.formula;
    }

    if (field.lookupReference && field.fieldType === 'lookup') {
      fieldData.properties = {
        lookupReference: field.lookupReference
      };
    }

    const response = await this.axios.post('/fields', fieldData);
    return response.data.id;
  }

  async updateField(tableId: string, fieldId: number, updates: Partial<QuickBaseField>): Promise<void> {
    await this.axios.post(`/fields/${fieldId}`, {
      tableId,
      ...updates
    });
  }

  async deleteField(tableId: string, fieldId: number): Promise<void> {
    await this.axios.delete(`/fields/${fieldId}`, {
      params: { tableId }
    });
  }

  // ========== RECORD METHODS ==========

  async getRecords(tableId: string, options?: QueryOptions): Promise<any[]> {
    const params: any = { from: tableId };
    
    if (options?.select) {
      params.select = options.select;
    }
    if (options?.where) {
      params.where = options.where;
    }
    if (options?.sortBy) {
      params.sortBy = options.sortBy;
    }
    if (options?.groupBy) {
      params.groupBy = options.groupBy;
    }
    if (options?.top) {
      params.top = options.top;
    }
    if (options?.skip) {
      params.skip = options.skip;
    }

    const response = await this.axios.post('/records/query', params);
    return response.data.data;
  }

  async getRecord(tableId: string, recordId: number, fieldIds?: number[]): Promise<any> {
    const params: any = { from: tableId };
    if (fieldIds) {
      params.select = fieldIds;
    }

    const response = await this.axios.post('/records/query', {
      ...params,
      where: `{3.EX.${recordId}}`
    });
    
    return response.data.data[0] || null;
  }

  async createRecord(tableId: string, record: QuickBaseRecord): Promise<number> {
    const response = await this.axios.post('/records', {
      to: tableId,
      data: [{
        ...record.fields
      }]
    });
    return response.data.data[0]['3'].value; // Record ID is always field 3
  }

  async createRecords(tableId: string, records: QuickBaseRecord[]): Promise<number[]> {
    const response = await this.axios.post('/records', {
      to: tableId,
      data: records.map(record => record.fields)
    });
    return response.data.data.map((record: any) => record['3'].value);
  }

  async updateRecord(tableId: string, recordId: number, updates: Record<string, any>): Promise<void> {
    await this.axios.post('/records', {
      to: tableId,
      data: [{
        '3': { value: recordId }, // Record ID field
        ...updates
      }]
    });
  }

  async updateRecords(tableId: string, records: Array<{ recordId: number; updates: Record<string, any> }>): Promise<void> {
    await this.axios.post('/records', {
      to: tableId,
      data: records.map(({ recordId, updates }) => ({
        '3': { value: recordId },
        ...updates
      }))
    });
  }

  async deleteRecord(tableId: string, recordId: number): Promise<void> {
    await this.axios.delete('/records', {
      data: {
        from: tableId,
        where: `{3.EX.${recordId}}`
      }
    });
  }

  async deleteRecords(tableId: string, recordIds: number[]): Promise<void> {
    const whereClause = recordIds.map(id => `{3.EX.${id}}`).join('OR');
    await this.axios.delete('/records', {
      data: {
        from: tableId,
        where: whereClause
      }
    });
  }

  // ========== RELATIONSHIP METHODS ==========

  async createRelationship(parentTableId: string, childTableId: string, foreignKeyFieldId: number): Promise<void> {
    await this.axios.post('/relationships', {
      parentTableId,
      childTableId,
      foreignKeyFieldId
    });
  }

  async getRelationships(tableId: string): Promise<any[]> {
    const response = await this.axios.get(`/relationships`, {
      params: { childTableId: tableId }
    });
    return response.data;
  }

  // ========== ENHANCED RELATIONSHIP METHODS ==========

  async createAdvancedRelationship(
    parentTableId: string, 
    childTableId: string, 
    referenceFieldLabel: string,
    lookupFields?: Array<{ parentFieldId: number; childFieldLabel: string }>,
    relationshipType: 'one-to-many' | 'many-to-many' = 'one-to-many'
  ): Promise<{ referenceFieldId: number; lookupFieldIds: number[] }> {
    try {
      // Step 1: Create the reference field in the child table
      const referenceFieldId = await this.createField(childTableId, {
        label: referenceFieldLabel,
        fieldType: 'reference',
        required: false,
        unique: false,
        properties: {
          lookupTableId: parentTableId
        }
      });

      // Step 2: Create the relationship
      await this.createRelationship(parentTableId, childTableId, referenceFieldId);

      // Step 3: Create lookup fields if specified
      const lookupFieldIds: number[] = [];
      if (lookupFields && lookupFields.length > 0) {
        for (const lookup of lookupFields) {
          const lookupFieldId = await this.createLookupField(
            childTableId,
            parentTableId,
            referenceFieldId,
            lookup.parentFieldId,
            lookup.childFieldLabel
          );
          lookupFieldIds.push(lookupFieldId);
        }
      }

      return { referenceFieldId, lookupFieldIds };
    } catch (error) {
      console.error('Error creating advanced relationship:', error);
      throw error;
    }
  }

  async createLookupField(
    childTableId: string,
    parentTableId: string,
    referenceFieldId: number,
    parentFieldId: number,
    lookupFieldLabel: string
  ): Promise<number> {
    const response = await this.axios.post('/fields', {
      tableId: childTableId,
      label: lookupFieldLabel,
      fieldType: 'lookup',
      properties: {
        lookupReference: {
          tableId: parentTableId,
          fieldId: parentFieldId,
          referenceFieldId: referenceFieldId
        }
      }
    });
    return response.data.id;
  }

  async validateRelationship(
    parentTableId: string,
    childTableId: string,
    foreignKeyFieldId: number
  ): Promise<{ isValid: boolean; issues: string[]; orphanedRecords: number }> {
    const issues: string[] = [];
    let orphanedRecords = 0;

    try {
      // Check if parent table exists
      await this.getTableInfo(parentTableId);
    } catch (error) {
      issues.push(`Parent table ${parentTableId} not found`);
    }

    try {
      // Check if child table exists
      await this.getTableInfo(childTableId);
    } catch (error) {
      issues.push(`Child table ${childTableId} not found`);
    }

    try {
      // Check if foreign key field exists
      const childFields = await this.getTableFields(childTableId);
      const foreignKeyField = childFields.find(field => field.id === foreignKeyFieldId);
      if (!foreignKeyField) {
        issues.push(`Foreign key field ${foreignKeyFieldId} not found in child table`);
      } else if (foreignKeyField.fieldType !== 'reference') {
        issues.push(`Field ${foreignKeyFieldId} is not a reference field`);
      }

      // Check for orphaned records (child records with invalid parent references)
      const childRecords = await this.getRecords(childTableId, {
        select: [3, foreignKeyFieldId], // Record ID and foreign key
        where: `{${foreignKeyFieldId}.XEX.''}`
      });

      for (const record of childRecords) {
        const foreignKeyValue = record[foreignKeyFieldId]?.value;
        if (foreignKeyValue) {
          try {
            await this.getRecord(parentTableId, foreignKeyValue);
          } catch (error) {
            orphanedRecords++;
          }
        }
      }

         } catch (error) {
       issues.push(`Error validating relationship: ${error instanceof Error ? error.message : 'Unknown error'}`);
     }

    return {
      isValid: issues.length === 0 && orphanedRecords === 0,
      issues,
      orphanedRecords
    };
  }

  async getRelationshipDetails(tableId: string, includeFields: boolean = true): Promise<any> {
    try {
      const relationships = await this.getRelationships(tableId);
      const tableInfo = await this.getTableInfo(tableId);
      
      const result = {
        tableId,
        tableName: tableInfo.name,
        relationships: [] as any[],
        relatedFields: [] as any[]
      };

      for (const relationship of relationships) {
        const relationshipDetail: any = {
          parentTableId: relationship.parentTableId,
          childTableId: relationship.childTableId,
          foreignKeyFieldId: relationship.foreignKeyFieldId,
          type: 'one-to-many' // QuickBase primarily supports one-to-many
        };

        if (includeFields) {
          // Get fields related to this relationship
          const fields = await this.getTableFields(tableId);
          const relatedFields = fields.filter(field => 
            field.fieldType === 'reference' || 
            field.fieldType === 'lookup' ||
            (field.properties && field.properties.lookupReference)
          );
          
          relationshipDetail.relatedFields = relatedFields;
        }

        result.relationships.push(relationshipDetail);
      }

      return result;
    } catch (error) {
      console.error('Error getting relationship details:', error);
      throw error;
    }
  }

  async createJunctionTable(
    junctionTableName: string,
    table1Id: string,
    table2Id: string,
    table1FieldLabel: string,
    table2FieldLabel: string,
    additionalFields?: Array<{ label: string; fieldType: string }>
  ): Promise<{ junctionTableId: string; table1ReferenceFieldId: number; table2ReferenceFieldId: number }> {
    try {
      // Step 1: Create the junction table
      const junctionTableId = await this.createTable({
        name: junctionTableName,
        description: `Junction table for many-to-many relationship between tables ${table1Id} and ${table2Id}`
      });

      // Step 2: Create reference field to first table
      const table1ReferenceFieldId = await this.createField(junctionTableId, {
        label: table1FieldLabel,
        fieldType: 'reference',
        required: true,
        unique: false,
        properties: {
          lookupTableId: table1Id
        }
      });

      // Step 3: Create reference field to second table
      const table2ReferenceFieldId = await this.createField(junctionTableId, {
        label: table2FieldLabel,
        fieldType: 'reference',
        required: true,
        unique: false,
        properties: {
          lookupTableId: table2Id
        }
      });

      // Step 4: Create relationships
      await this.createRelationship(table1Id, junctionTableId, table1ReferenceFieldId);
      await this.createRelationship(table2Id, junctionTableId, table2ReferenceFieldId);

      // Step 5: Create additional fields if specified
      if (additionalFields && additionalFields.length > 0) {
        for (const field of additionalFields) {
          await this.createField(junctionTableId, {
            label: field.label,
            fieldType: field.fieldType as any,
            required: false,
            unique: false
          });
        }
      }

      return {
        junctionTableId,
        table1ReferenceFieldId,
        table2ReferenceFieldId
      };
    } catch (error) {
      console.error('Error creating junction table:', error);
      throw error;
    }
  }

  // ========== REPORT METHODS ==========

  async getReports(tableId: string): Promise<any[]> {
    const response = await this.axios.get('/reports', {
      params: { tableId }
    });
    return response.data;
  }

  async runReport(reportId: string, tableId: string): Promise<any[]> {
    const response = await this.axios.post('/records/query', {
      from: tableId,
      options: {
        reportId
      }
    });
    return response.data.data;
  }

  // ========== UTILITY METHODS ==========

  async testConnection(): Promise<boolean> {
    try {
      await this.getAppInfo();
      return true;
    } catch (error) {
      return false;
    }
  }

  async searchRecords(tableId: string, searchTerm: string, fieldIds?: number[]): Promise<any[]> {
    // This is a simple implementation - you might want to enhance based on your search needs
    const whereClause = fieldIds 
      ? fieldIds.map(fieldId => `{${fieldId}.CT.'${searchTerm}'}`).join('OR')
      : `{6.CT.'${searchTerm}'}OR{7.CT.'${searchTerm}'}`; // Common text fields

    return this.getRecords(tableId, { where: whereClause });
  }

  // ========== BULK OPERATIONS ==========

  async upsertRecords(tableId: string, records: Array<{ keyField: number; keyValue: any; data: Record<string, any> }>): Promise<any> {
    // QuickBase upsert based on a key field
    return await this.axios.post('/records', {
      to: tableId,
      data: records.map(({ keyField, keyValue, data }) => ({
        [keyField]: { value: keyValue },
        ...data
      })),
      mergeFieldId: records[0]?.keyField
    });
  }

  // ========== CODEPAGE METHODS (Table Storage) ==========

  async saveCodepage(tableId: string, name: string, code: string, description?: string): Promise<number> {
    const recordData: Record<string, any> = {
      6: { value: name }, // Assuming field 6 is name
      7: { value: code }, // Assuming field 7 is code
    };
    if (description) {
      recordData[8] = { value: description }; // Assuming field 8 is description
    }

    const response = await this.axios.post('/records', {
      to: tableId,
      data: [recordData]
    });
    return response.data.metadata.createdRecordIds[0];
  }

  async getCodepage(tableId: string, recordId: number): Promise<any> {
    return this.getRecord(tableId, recordId);
  }

  async listCodepages(tableId: string, limit?: number): Promise<any[]> {
    const options: any = {};
    if (limit) {
      options.top = limit;
    }
    return this.getRecords(tableId, options);
  }

  async executeCodepage(tableId: string, recordId: number, functionName: string, parameters?: Record<string, any>): Promise<any> {
    const codepage = await this.getCodepage(tableId, recordId);
    // Extract code from the record (assuming field 7 is code)
    const code = codepage['7']?.value;
    if (!code) {
      throw new Error('Codepage does not contain code');
    }

    // For safety, we'll return the code and parameters instead of executing
    // In a real implementation, you might want to sandbox the execution
    return {
      functionName,
      parameters,
      code,
      note: 'Code execution is not implemented for security reasons. Use the code in your application.'
    };
  }

  // ========== QUICKBASE CODEPAGE DEPLOYMENT METHODS ==========

  /**
   * Deploy code to a QuickBase built-in codepage (pageID-based)
   * Note: This uses QuickBase's legacy API which requires special permissions
   */
  async deployToCodepage(appId: string, pageId: number, code: string, pageName?: string): Promise<{ success: boolean; pageId: number; url: string }> {
    // QuickBase doesn't have a public API for managing codepages via REST API
    // They must be managed through the UI or using the old XML API
    // This method provides the information needed for manual deployment

    const realm = this.config.realm.replace('.quickbase.com', '');
    const codepageUrl = `https://${this.config.realm}/db/${appId}?a=dbpage&pageID=${pageId}`;

    return {
      success: false,
      pageId: pageId,
      url: codepageUrl,
      instructions: {
        message: 'QuickBase codepages must be deployed manually through the UI',
        steps: [
          `1. Go to https://${this.config.realm}/db/${appId}`,
          '2. Click "Pages" → "Code Pages"',
          `3. Create or edit pageID=${pageId}`,
          '4. Paste the code provided',
          '5. Save the codepage',
          `6. Access via: ${codepageUrl}`
        ],
        code: code,
        codeSize: `${Math.round(code.length / 1024)}KB`
      }
    } as any;
  }

  /**
   * Test loading a codepage from QuickBase
   * This attempts to fetch a codepage via HTTP to verify it's deployed
   */
  async testLoadCodepage(appId: string, pageId: number): Promise<{ success: boolean; size?: number; error?: string }> {
    const realm = this.config.realm;
    const codepageUrl = `https://${realm}/db/${appId}?a=dbpage&pageID=${pageId}`;

    try {
      // Use fetch to try loading the codepage
      const axios = (await import('axios')).default;
      const response = await axios.get(codepageUrl, {
        headers: {
          'User-Agent': 'QuickBase-MCP-Client/1.0'
        },
        maxRedirects: 0,
        validateStatus: (status) => status < 400
      });

      const content = response.data;
      const isJavaScript = typeof content === 'string' && (
        content.includes('function') ||
        content.includes('const ') ||
        content.includes('var ') ||
        content.includes('class ')
      );

      return {
        success: true,
        size: typeof content === 'string' ? content.length : 0,
        contentType: response.headers['content-type'],
        isJavaScript,
        preview: typeof content === 'string' ? content.substring(0, 200) : 'Binary content'
      } as any;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status
      } as any;
    }
  }

  /**
   * Test saving data from a codepage to QuickBase
   * This simulates what a codepage would do when saving records
   */
  async testCodepageSave(tableId: string, testData: Record<string, any>): Promise<{ success: boolean; recordId?: number; error?: string }> {
    try {
      // Test with session-based auth (what codepages use)
      const response = await this.axios.post('/records', {
        to: tableId,
        data: [testData]
      });

      const recordId = response.data.metadata?.createdRecordIds?.[0];

      return {
        success: true,
        recordId,
        message: 'Record created successfully via codepage-style save',
        metadata: response.data.metadata
      } as any;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        details: error.response?.data
      } as any;
    }
  }

  /**
   * Validate codepage code for common issues
   */
  validateCodepageCode(code: string): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for common issues
    if (code.length === 0) {
      errors.push('Code is empty');
    }

    if (code.length > 1000000) {
      warnings.push(`Code is very large (${Math.round(code.length / 1024)}KB) - may cause performance issues`);
    }

    // Check for syntax errors (basic check)
    try {
      new Function(code);
    } catch (e: any) {
      errors.push(`JavaScript syntax error: ${e.message}`);
    }

    // Check for session authentication usage
    if (code.includes('QB-USER-TOKEN') || code.includes('userToken')) {
      warnings.push('Code contains user token references - consider using session authentication instead');
    }

    if (code.includes("credentials: 'include'")) {
      // Good - using session auth
    } else if (code.includes('fetch(') || code.includes('axios')) {
      warnings.push('Code makes HTTP requests but may not be using session authentication');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ========== CODEPAGE DEVELOPMENT HELPERS ==========

  /**
   * Get full table schema with field information for codepage development
   */
  async getTableSchemaForCodepage(tableId: string): Promise<any> {
    const fields = await this.getTableFields(tableId);

    // Organize fields by type and purpose
    const schema = {
      tableId,
      userFields: fields.filter((f: any) => f.mode === '' || f.mode === 'normal'),
      lookupFields: fields.filter((f: any) => f.mode === 'lookup'),
      formulaFields: fields.filter((f: any) => f.mode === 'formula'),
      systemFields: fields.filter((f: any) => ['recordid', 'timestamp', 'user'].includes(f.fieldType)),
      fieldMap: {} as Record<string, number>,
      fieldTypes: {} as Record<number, string>
    };

    // Generate field mappings
    fields.forEach((field: any) => {
      const safeName = field.label.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      schema.fieldMap[safeName] = field.id;
      schema.fieldTypes[field.id] = field.fieldType;
    });

    return schema;
  }

  /**
   * Generate JavaScript field mapping code for a table
   */
  async generateFieldMapCode(tableId: string): Promise<string> {
    const fields = await this.getTableFields(tableId);

    let code = '// QuickBase Field Mapping\n';
    code += 'const FIELDS = {\n';

    fields
      .filter((f: any) => f.mode !== 'formula' && f.mode !== 'lookup')
      .forEach((field: any) => {
        const safeName = field.label
          .replace(/[^a-zA-Z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '')
          .toUpperCase();

        code += `  ${safeName}: ${field.id}, // ${field.label} (${field.fieldType})\n`;
      });

    code += '};\n';
    return code;
  }

  /**
   * Get common code snippets for codepage development
   */
  getCodeSnippet(snippetName: string): string {
    const snippets: Record<string, string> = {
      'session-auth-fetch': `// Session-authenticated fetch
async function qbFetch(endpoint, data) {
  const response = await fetch('https://api.quickbase.com/v1' + endpoint, {
    method: 'POST',
    headers: {
      'QB-Realm-Hostname': '${this.config.realm}',
      'Content-Type': 'application/json'
    },
    credentials: 'include', // Use session cookies
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
  return await response.json();
}`,

      'create-record': `// Create a record
const recordData = { 6: { value: 'Test' }, 7: { value: 123 } };
const result = await qbClient.createRecords(tableId, [recordData]);
const recordId = result.metadata.createdRecordIds[0];`,

      'query-records': `// Query records
const result = await qbClient.queryRecords(tableId, {
  select: [3, 6, 7],
  where: "{6.EX.'value'}",
  top: 100
});`,

      'update-record': `// Update record
await qbClient.updateRecords(tableId, [{
  3: { value: recordId },
  6: { value: 'Updated' }
}]);`,

      'delete-record': `// Delete record
await qbClient.deleteRecords(tableId, [recordId]);`,

      'error-handling': `// Error handling
try {
  await qbClient.createRecords(tableId, [data]);
} catch (error) {
  if (error.message.includes('Session expired')) {
    alert('Please refresh the page');
  } else {
    console.error('Error:', error);
  }
}`
    };

    return snippets[snippetName] || `// Snippet '${snippetName}' not found`;
  }

  /**
   * Test API permissions for a table
   */
  async testApiPermissions(tableId: string): Promise<any> {
    const permissions = {
      tableId,
      canRead: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canGetFields: false,
      errors: [] as string[]
    };

    // Test read
    try {
      await this.getRecords(tableId, { top: 1 });
      permissions.canRead = true;
    } catch (error: any) {
      permissions.errors.push(`Read: ${error.message}`);
    }

    // Test fields
    try {
      await this.getTableFields(tableId);
      permissions.canGetFields = true;
    } catch (error: any) {
      permissions.errors.push(`Fields: ${error.message}`);
    }

    return permissions;
  }

  // ========== AUTH METHODS ==========

  generateOAuthUrl(clientId: string, redirectUri: string, scopes: string[] = ['read:table', 'write:table']): string {
    // This is a simplified OAuth URL generation
    // In practice, you'd need PKCE implementation
    const realm = this.config.realm;
    const scope = scopes.join(' ');
    const state = Math.random().toString(36).substring(2);
    
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      scope,
      redirect_uri: redirectUri,
      state
    });

    return `https://${realm}/oauth2/authorize?${params.toString()}`;
  }
} 