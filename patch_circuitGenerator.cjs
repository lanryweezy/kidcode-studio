const fs = require('fs');

const path = 'src/services/ai/circuitGenerator.ts';
let code = fs.readFileSync(path, 'utf8');

const search = `    const response = await generateCodeFromPrompt(prompt, AppMode.HARDWARE);
    // Parse response (simplified - in production would parse JSON)
    return {
      success: true,
      circuit: {
        components: [],
        wires: [],
        code: typeof response === 'string' ? response : '',
        explanation: \`AI-generated circuit for: \${request.description}\`,
      },`;

const replace = `    const response = await generateCodeFromPrompt(prompt, AppMode.HARDWARE);

    // 🤖 Astra: [AI quality improvement]
    // Properly extract and parse the JSON block containing the circuit definition from the AI's response text.
    // Also validate the structure to ensure 'components' and 'wires' are arrays, failing safely if the model hallucinated.
    let parsedComponents: CircuitComponent[] = [];
    let parsedWires: Wire[] = [];
    let extractedCode = '';
    let extractedExplanation = \`AI-generated circuit for: \${request.description}\`;

    if (response && response.text) {
        try {
            // Find JSON block if present
            const startIdx = response.text.indexOf('{');
            const endIdx = response.text.lastIndexOf('}');
            if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
                const parsed = JSON.parse(response.text.substring(startIdx, endIdx + 1));
                if (Array.isArray(parsed.components)) parsedComponents = parsed.components;
                if (Array.isArray(parsed.wires)) parsedWires = parsed.wires;
                if (typeof parsed.code === 'string') extractedCode = parsed.code;
                if (typeof parsed.explanation === 'string') extractedExplanation = parsed.explanation;
            }
        } catch(e) {
            console.error("AI Validation Error: could not parse circuit JSON", e);
        }
    }

    return {
      success: true,
      circuit: {
        components: parsedComponents,
        wires: parsedWires,
        code: extractedCode || (response && response.text ? response.text : ''),
        explanation: extractedExplanation,
      },`;

code = code.replace(search, replace);
fs.writeFileSync(path, code);
