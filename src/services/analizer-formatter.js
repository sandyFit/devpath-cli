export function formatResults(data) {
    return `
  📊 Analysis Results
  
  🔤 Languages:
  ${data.languages.map(l => `  • ${l.name}: ${l.count}`).join('\n')}
  
  🛠️ Frameworks: 
  ${data.frameworks.map(f => `  • ${f.name}`).join('\n')}
  
  🧰 Tools:
  ${data.tools.map(t => `  • ${t.name}`).join('\n')}
  
  📈 Quality:
  ${data.codeQuality.map(q => `  • ${q.message}`).join('\n')}
  `;
  }
