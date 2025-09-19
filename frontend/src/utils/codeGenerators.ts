import { Component } from '../types';

// Generate React JSX code from components
export const generateReactCode = (components: Component[]): string => {
  if (!components || components.length === 0) {
    return `import React from 'react';

const Page = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to your page</h1>
        <p className="text-gray-600 mt-2">Start building by adding components from the palette.</p>
      </div>
    </div>
  );
};

export default Page;`;
  }

  const generateComponentJSX = (component: Component, depth = 0): string => {
    const indent = '  '.repeat(depth + 2);
    const props = Object.entries(component.props || {})
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? key : '';
        } else {
          return `${key}={${JSON.stringify(value)}}`;
        }
      })
      .filter(Boolean)
      .join(' ');

    const styleProps = component.style ? ` style={${JSON.stringify(component.style)}}` : '';
    const positionStyle = component.position 
      ? ` style={{
        position: 'absolute',
        left: '${component.position.x}px',
        top: '${component.position.y}px',
        ${component.width ? `width: '${component.width}px',` : ''}
        ${component.height ? `height: '${component.height}px',` : ''}
        ...${JSON.stringify(component.style || {})}
      }}`
      : styleProps;

    const openingTag = `${indent}<${component.type}${props ? ' ' + props : ''}${positionStyle}>`;
    
    if (component.children && component.children.length > 0) {
      const childrenJSX = component.children
        .map(child => generateComponentJSX(child, depth + 1))
        .join('\n');
      return `${openingTag}\n${childrenJSX}\n${indent}</${component.type}>`;
    } else {
      // Handle text content
      const textContent = component.props?.children || component.props?.text || '';
      if (textContent) {
        return `${openingTag}${textContent}</${component.type}>`;
      }
      return `${openingTag}</${component.type}>`;
    }
  };

  const componentsJSX = components
    .map(component => generateComponentJSX(component))
    .join('\n');

  return `import React from 'react';

const Page = () => {
  return (
    <div className="relative min-h-screen">
${componentsJSX}
    </div>
  );
};

export default Page;`;
};

// Generate HTML code from components
export const generateHTMLCode = (components: Component[]): string => {
  if (!components || components.length === 0) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div class="min-h-screen bg-gray-50">
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-2xl font-bold text-gray-900">Welcome to your page</h1>
            <p class="text-gray-600 mt-2">Start building by adding components from the palette.</p>
        </div>
    </div>
</body>
</html>`;
  }

  const generateComponentHTML = (component: Component, depth = 0): string => {
    const indent = '    '.repeat(depth + 2);
    
    // Convert React props to HTML attributes
    const htmlProps = Object.entries(component.props || {})
      .map(([key, value]) => {
        if (key === 'className') return `class="${value}"`;
        if (key === 'htmlFor') return `for="${value}"`;
        if (typeof value === 'string') return `${key}="${value}"`;
        if (typeof value === 'boolean') return value ? key : '';
        return `${key}="${value}"`;
      })
      .filter(Boolean)
      .join(' ');

    // Generate inline styles
    const inlineStyle = component.style || component.position ? 
      ` style="${Object.entries({
        ...(component.position ? {
          position: 'absolute',
          left: `${component.position.x}px`,
          top: `${component.position.y}px`,
          ...(component.width && { width: `${component.width}px` }),
          ...(component.height && { height: `${component.height}px` })
        } : {}),
        ...(component.style || {})
      }).map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v}`).join('; ')}"` : '';

    const tagName = component.type === 'div' ? 'div' : 
                   component.type === 'button' ? 'button' :
                   component.type === 'input' ? 'input' :
                   component.type === 'img' ? 'img' :
                   component.type === 'h1' ? 'h1' :
                   component.type === 'h2' ? 'h2' :
                   component.type === 'h3' ? 'h3' :
                   component.type === 'p' ? 'p' :
                   component.type === 'span' ? 'span' :
                   'div';

    const isSelfClosing = ['input', 'img', 'br', 'hr'].includes(tagName);
    const openingTag = `${indent}<${tagName}${htmlProps ? ' ' + htmlProps : ''}${inlineStyle}${isSelfClosing ? ' /' : ''}>`;

    if (isSelfClosing) {
      return openingTag;
    }

    if (component.children && component.children.length > 0) {
      const childrenHTML = component.children
        .map(child => generateComponentHTML(child, depth + 1))
        .join('\n');
      return `${openingTag}\n${childrenHTML}\n${indent}</${tagName}>`;
    } else {
      const textContent = component.props?.children || component.props?.text || '';
      if (textContent) {
        return `${openingTag}${textContent}</${tagName}>`;
      }
      return `${openingTag}</${tagName}>`;
    }
  };

  const componentsHTML = components
    .map(component => generateComponentHTML(component))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div class="relative min-h-screen">
${componentsHTML}
    </div>
</body>
</html>`;
};

// Generate CSS code from components and styles
export const generateCSSCode = (components: Component[], pageStyles: Record<string, any> = {}): string => {
  const cssRules: string[] = [];

  // Add page-level styles
  if (Object.keys(pageStyles).length > 0) {
    const pageStylesCSS = Object.entries(pageStyles)
      .map(([property, value]) => `  ${property.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
      .join('\n');
    
    cssRules.push(`body {\n${pageStylesCSS}\n}`);
  }

  // Generate CSS for components
  const generateComponentCSS = (component: Component): void => {
    if (component.style && Object.keys(component.style).length > 0) {
      const selector = component.props?.id ? `#${component.props.id}` : 
                     component.props?.className ? `.${component.props.className.split(' ')[0]}` :
                     `.component-${component.id}`;
      
      const styles = Object.entries(component.style)
        .map(([property, value]) => `  ${property.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
        .join('\n');
      
      cssRules.push(`${selector} {\n${styles}\n}`);
    }

    if (component.position) {
      const selector = component.props?.id ? `#${component.props.id}` : `.component-${component.id}`;
      const positionCSS = [
        '  position: absolute;',
        `  left: ${component.position.x}px;`,
        `  top: ${component.position.y}px;`,
        ...(component.width ? [`  width: ${component.width}px;`] : []),
        ...(component.height ? [`  height: ${component.height}px;`] : [])
      ].join('\n');
      
      cssRules.push(`${selector} {\n${positionCSS}\n}`);
    }

    // Process children
    if (component.children) {
      component.children.forEach(generateComponentCSS);
    }
  };

  components.forEach(generateComponentCSS);

  if (cssRules.length === 0) {
    return `/* No custom styles generated */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}`;
  }

  return cssRules.join('\n\n');
};
