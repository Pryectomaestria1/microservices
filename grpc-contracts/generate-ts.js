const fs = require('fs');
const path = require('path');

const protoDir = __dirname;
const files = fs.readdirSync(protoDir).filter(f => f.endsWith('.proto'));

let tsContent = `// Auto-generated from .proto files. Do not edit manually.
import { Observable } from 'rxjs';

`;

for (const file of files) {
  const filePath = path.join(protoDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const namespace = file.replace('.proto', '');
  const capitalizedNamespace = namespace.charAt(0).toUpperCase() + namespace.slice(1);
  
  tsContent += `// =========================================\n// Namespace: ${capitalizedNamespace}\n// =========================================\n\n`;
  
  // Parse messages
  let idx = 0;
  while (true) {
    const msgStart = content.indexOf('message ', idx);
    if (msgStart === -1) break;
    
    const nameStart = msgStart + 8;
    const nameEnd = content.indexOf('{', nameStart);
    if (nameEnd === -1) break;
    
    const messageName = content.slice(nameStart, nameEnd).trim();
    
    let braceCount = 1;
    let blockEnd = nameEnd + 1;
    while (braceCount > 0 && blockEnd < content.length) {
      if (content[blockEnd] === '{') braceCount++;
      else if (content[blockEnd] === '}') braceCount--;
      blockEnd++;
    }
    
    const fieldsBlock = content.slice(nameEnd + 1, blockEnd - 1);
    idx = blockEnd;
    
    tsContent += `export interface ${messageName} {\n`;
    
    const lines = fieldsBlock.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('//')) continue;
      
      const fieldMatch = /^(repeated|optional)?\s*([\w\.]+)\s+(\w+)\s*=\s*\d+;/.exec(line);
      if (fieldMatch) {
        const modifier = fieldMatch[1] ? fieldMatch[1].trim() : '';
        const protoType = fieldMatch[2];
        const fieldName = fieldMatch[3];
        
        let tsType = 'any';
        if (protoType === 'string') tsType = 'string';
        else if (protoType === 'double' || protoType === 'float' || protoType === 'int32' || protoType === 'int64' || protoType === 'uint32') tsType = 'number';
        else if (protoType === 'bool') tsType = 'boolean';
        else if (protoType === 'google.protobuf.Timestamp') tsType = 'any';
        else tsType = protoType;
        
        if (modifier === 'repeated') {
          tsType = `${tsType}[]`;
        }
        
        tsContent += `  ${fieldName}?: ${tsType};\n`;
      }
    }
    tsContent += `}\n\n`;
  }
  
  // Parse services
  idx = 0;
  while (true) {
    const serviceStart = content.indexOf('service ', idx);
    if (serviceStart === -1) break;
    
    const nameStart = serviceStart + 8;
    const nameEnd = content.indexOf('{', nameStart);
    if (nameEnd === -1) break;
    
    const serviceName = content.slice(nameStart, nameEnd).trim();
    
    let braceCount = 1;
    let blockEnd = nameEnd + 1;
    while (braceCount > 0 && blockEnd < content.length) {
      if (content[blockEnd] === '{') braceCount++;
      else if (content[blockEnd] === '}') braceCount--;
      blockEnd++;
    }
    
    const methodsBlock = content.slice(nameEnd + 1, blockEnd - 1);
    idx = blockEnd;
    
    tsContent += `export interface ${serviceName} {\n`;
    
    const lines = methodsBlock.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('//')) continue;
      
      const rpcMatch = /rpc\s+(\w+)\s*\(\s*([\w\.]+)\s*\)\s*returns\s*\(\s*([\w\.]+)\s*\);/.exec(line);
      if (rpcMatch) {
        const methodName = rpcMatch[1];
        const camelMethodName = methodName.charAt(0).toLowerCase() + methodName.slice(1);
        const inputType = rpcMatch[2];
        const outputType = rpcMatch[3];
        
        tsContent += `  ${camelMethodName}(request: ${inputType}): Observable<${outputType}> | Promise<${outputType}> | ${outputType};\n`;
      }
    }
    tsContent += `}\n\n`;
  }
}

fs.writeFileSync(path.join(protoDir, 'index.ts'), tsContent);
console.log('Successfully generated TypeScript interfaces in grpc-contracts/index.ts');
