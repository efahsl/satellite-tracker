#!/usr/bin/env node

/**
 * Migration Script: Convert to CSS Modules
 * 
 * This script helps migrate existing components from global CSS to CSS Modules.
 * It analyzes existing CSS files and provides migration guidance.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');
const STYLES_DIR = path.join(SRC_DIR, 'styles');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function findCSSFiles(dir) {
  const files = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (item.endsWith('.css') && !item.endsWith('.module.css')) {
        files.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return files;
}

function analyzeCSSFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const analysis = {
    file: path.relative(process.cwd(), filePath),
    totalLines: lines.length,
    selectors: [],
    mediaQueries: 0,
    hasGlobalSelectors: false,
    hasComponentSelectors: false,
    recommendations: [],
  };
  
  let inMediaQuery = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Count media queries
    if (trimmed.startsWith('@media')) {
      analysis.mediaQueries++;
      inMediaQuery = true;
    } else if (trimmed.startsWith('}') && inMediaQuery) {
      inMediaQuery = false;
    }
    
    // Find CSS selectors
    if (trimmed && !trimmed.startsWith('/*') && !trimmed.startsWith('@') && !trimmed.startsWith('}')) {
      const selectorMatch = trimmed.match(/^([^{]+)/);
      if (selectorMatch) {
        const selector = selectorMatch[1].trim();
        if (selector && !selector.includes(':')) {
          analysis.selectors.push(selector);
          
          // Check if it's a global selector
          if (selector.startsWith('.') && !selector.includes('__') && !selector.includes('--')) {
            analysis.hasGlobalSelectors = true;
          }
          
          // Check if it's a component selector
          if (selector.includes('__') || selector.includes('--')) {
            analysis.hasComponentSelectors = true;
          }
        }
      }
    }
  }
  
  // Generate recommendations
  if (analysis.hasComponentSelectors) {
    analysis.recommendations.push('This file uses BEM-like selectors - good candidate for CSS Modules');
  }
  
  if (analysis.hasGlobalSelectors) {
    analysis.recommendations.push('Contains global selectors - needs careful migration');
  }
  
  if (analysis.mediaQueries > 0) {
    analysis.recommendations.push(`Contains ${analysis.mediaQueries} media queries - ensure responsive design is maintained`);
  }
  
  if (analysis.totalLines > 200) {
    analysis.recommendations.push('Large file - consider breaking into smaller modules');
  }
  
  return analysis;
}

function generateMigrationPlan(analysis) {
  const plan = [];
  
  for (const file of analysis) {
    const relativePath = file.file;
    const componentName = path.basename(path.dirname(relativePath));
    const cssFileName = path.basename(relativePath, '.css');
    
    plan.push({
      component: componentName,
      currentFile: relativePath,
      newFile: relativePath.replace('.css', '.module.css'),
      complexity: file.totalLines > 200 ? 'High' : file.totalLines > 100 ? 'Medium' : 'Low',
      priority: file.hasComponentSelectors ? 'High' : 'Medium',
      recommendations: file.recommendations,
    });
  }
  
  return plan.sort((a, b) => {
    if (a.priority === 'High' && b.priority !== 'High') return -1;
    if (b.priority === 'High' && a.priority !== 'High') return 1;
    return a.complexity === 'High' ? -1 : 1;
  });
}

function generateMigrationTemplate(plan) {
  let template = `# CSS Modules Migration Plan

## Overview
This document outlines the migration plan from global CSS to CSS Modules for the Satellite Tracker project.

## Migration Priority

`;

  for (const item of plan) {
    template += `### ${item.component} (${item.priority} Priority, ${item.complexity} Complexity)
- **Current File:** \`${item.currentFile}\`
- **New File:** \`${item.newFile}\`
- **Recommendations:**
${item.recommendations.map(rec => `  - ${rec}`).join('\n')}

`;
  }
  
  template += `## Migration Steps

1. **Phase 1: High Priority Components** (Week 1)
   - Convert components with BEM-like selectors first
   - These are easiest to migrate and provide immediate benefits

2. **Phase 2: Medium Priority Components** (Week 2)
   - Convert remaining component-specific CSS files
   - Update component imports and class references

3. **Phase 3: Global CSS Cleanup** (Week 3)
   - Remove migrated styles from global CSS files
   - Update any remaining global references

4. **Phase 4: Testing & Optimization** (Week 4)
   - Test all components for visual regressions
   - Optimize CSS Modules for performance

## Migration Checklist

For each component:

- [ ] Create \`.module.css\` file
- [ ] Move component-specific styles to CSS Module
- [ ] Update component to import CSS Module
- [ ] Replace \`className\` references with \`styles.className\`
- [ ] Test component functionality
- [ ] Test responsive design
- [ ] Test accessibility features
- [ ] Remove old CSS from global files

## Example Migration

### Before (Global CSS)
\`\`\`tsx
// Component.tsx
<div className="component component--variant">

// global.css
.component { /* styles */ }
.component--variant { /* styles */ }
\`\`\`

### After (CSS Modules)
\`\`\`tsx
// Component.tsx
import styles from './Component.module.css';
<div className={\`\${styles.component} \${styles['component--variant']}\`}>

// Component.module.css
.component { /* styles */ }
.component--variant { /* styles */ }
\`\`\`

## Testing Strategy

1. **Visual Regression Testing**
   - Compare before/after screenshots
   - Test on multiple screen sizes

2. **Functionality Testing**
   - Ensure all interactive elements work
   - Test hover/focus states

3. **Performance Testing**
   - Measure CSS bundle size
   - Check for layout thrashing

4. **Accessibility Testing**
   - Verify focus indicators
   - Test with screen readers

## Rollback Plan

If issues arise during migration:

1. Keep old CSS files as backup
2. Use feature flags to toggle between old/new styles
3. Revert individual components if needed
4. Document any breaking changes

## Success Metrics

- [ ] 100% of components using CSS Modules
- [ ] No visual regressions
- [ ] Improved CSS bundle size
- [ ] Better component isolation
- [ ] Improved maintainability scores
`;

  return template;
}

function main() {
  log('🔍 Analyzing CSS files for migration to CSS Modules...', colors.blue);
  
  // Find all CSS files
  const cssFiles = findCSSFiles(SRC_DIR);
  
  if (cssFiles.length === 0) {
    log('✅ No CSS files found to migrate!', colors.green);
    return;
  }
  
  log(`📁 Found ${cssFiles.length} CSS files to analyze`, colors.cyan);
  
  // Analyze each file
  const analysis = cssFiles.map(analyzeCSSFile);
  
  // Generate migration plan
  const migrationPlan = generateMigrationPlan(analysis);
  
  // Display summary
  log('\n📊 Migration Analysis Summary:', colors.bright);
  log('=' .repeat(50), colors.yellow);
  
  for (const item of migrationPlan) {
    const priorityColor = item.priority === 'High' ? colors.red : item.priority === 'Medium' ? colors.yellow : colors.green;
    const complexityColor = item.complexity === 'High' ? colors.red : item.complexity === 'Medium' ? colors.yellow : colors.green;
    
    log(`\n${item.component}:`, colors.bright);
    log(`  Priority: ${item.priority}`, priorityColor);
    log(`  Complexity: ${item.complexity}`, complexityColor);
    log(`  Current: ${item.currentFile}`, colors.cyan);
    log(`  New: ${item.newFile}`, colors.green);
  }
  
  // Generate migration plan file
  const planContent = generateMigrationTemplate(migrationPlan);
  const planPath = path.join(process.cwd(), 'CSS_MODULES_MIGRATION_PLAN.md');
  
  fs.writeFileSync(planPath, planContent);
  
  log(`\n📋 Migration plan saved to: ${planPath}`, colors.green);
  log('\n🚀 Ready to start migration!', colors.bright);
  
  // Display next steps
  log('\n📋 Next Steps:', colors.bright);
  log('1. Review the migration plan', colors.cyan);
  log('2. Start with high-priority components', colors.yellow);
  log('3. Test each component after migration', colors.green);
  log('4. Remove old CSS once migration is complete', colors.magenta);
}

if (require.main === module) {
  main();
}

module.exports = { main, findCSSFiles, analyzeCSSFile, generateMigrationPlan };
