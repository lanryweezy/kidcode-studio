
import { AppMode, CommandBlock, CommandType } from '../types';

interface ValidationError {
  index: number;
  message: string;
  severity: 'error' | 'warning';
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validates control structure matching (IF/ELSE/END_IF, REPEAT/END_REPEAT)
 * Prevents generating broken code from mismatched blocks
 */
const validateControlStructures = (commands: CommandBlock[]): ValidationResult => {
  const errors: ValidationError[] = [];
  const stack: { type: CommandType; index: number }[] = [];

  commands.forEach((cmd, idx) => {
    // Push opening blocks onto stack
    if ([CommandType.REPEAT, CommandType.IF, CommandType.FOREVER].includes(cmd.type)) {
      stack.push({ type: cmd.type, index: idx });
    }
    
    // Handle closing blocks
    if (cmd.type === CommandType.END_REPEAT) {
      const last = stack.pop();
      if (!last || last.type !== CommandType.REPEAT) {
        errors.push({
          index: idx,
          message: 'END_REPEAT without matching REPEAT',
          severity: 'error'
        });
      }
    }
    
    if (cmd.type === CommandType.ELSE) {
      const last = stack[stack.length - 1];
      if (!last || last.type !== CommandType.IF) {
        errors.push({
          index: idx,
          message: 'ELSE without matching IF',
          severity: 'error'
        });
      }
    }
    
    if (cmd.type === CommandType.END_IF) {
      const last = stack.pop();
      if (!last || last.type !== CommandType.IF) {
        errors.push({
          index: idx,
          message: 'END_IF without matching IF',
          severity: 'error'
        });
      }
    }
  });

  // Check for unclosed blocks
  stack.forEach(item => {
    errors.push({
      index: item.index,
      message: `Unclosed ${item.type} block`,
      severity: 'error'
    });
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

export const generateCode = (
  commands: CommandBlock[], 
  mode: AppMode
): { code: string; errors: ValidationError[] } => {
  // Validate control structures first
  const validation = validateControlStructures(commands);
  
  if (!validation.valid) {
    return { code: '', errors: validation.errors };
  }

  let code = '';
  let indentLevel = 0;

  const getIndent = () => '  '.repeat(indentLevel);

  // Header generation
  if (mode === AppMode.HARDWARE) {
    code += `// Circuit Lab - Arduino/C++ Sketch\n`;
    code += `void setup() {\n`;
    code += `  Serial.begin(9600);\n`;
    // Infer setup from used pins (simplified)
    code += `  pinMode(LED_BUILTIN, OUTPUT);\n`;
    code += `}\n\n`;
    code += `void loop() {\n`;
    indentLevel = 1;
  } else if (mode === AppMode.GAME) {
    code += `// Game Maker - JavaScript\n`;
    code += `const sprite = new Sprite('🤖');\n\n`;
    code += `async function runGame() {\n`;
    indentLevel = 1;
  } else {
    code += `// App Maker - React/JavaScript\n`;
    code += `const app = new App('My App');\n\n`;
    code += `async function renderUI() {\n`;
    indentLevel = 1;
  }

  // Command translation
  commands.forEach(cmd => {
    const i = getIndent();
    
    // Handle indentation for control flow structure closing
    if (cmd.type === CommandType.END_REPEAT || cmd.type === CommandType.END_IF || cmd.type === CommandType.ELSE) {
       // logic handled below
    }

    switch (cmd.type) {
      // --- LOGIC & CONTROL ---
      case CommandType.WAIT:
      case CommandType.SLEEP:
        code += `${i}await delay(${cmd.params.value || 1}000);\n`;
        break;
      
      case CommandType.REPEAT:
        code += `${i}for (let i = 0; i < ${cmd.params.value || 1}; i++) {\n`;
        indentLevel++;
        break;
      
      case CommandType.END_REPEAT:
        indentLevel = Math.max(0, indentLevel - 1);
        code += `${getIndent()}}\n`;
        break;

      case CommandType.IF:
        let condition = 'true';
        const p = cmd.params;
        if (p.condition === 'IS_PRESSED') condition = `digitalRead(${p.pin || 4}) == HIGH`;
        else if (p.condition === 'IS_DARK') condition = `analogRead(5) < 100`; 
        else if (p.condition === 'IS_TEMP_HIGH') condition = `getTemp() > ${p.value}`;
        else if (p.condition === 'DIST_LESS_THAN') condition = `getDistance() < ${p.value}`;
        else if (p.condition === 'IS_TOUCHING_EDGE') condition = `sprite.isTouchingEdge()`;
        else if (p.condition === 'KEY_IS') condition = `keypad.getKey() == '${p.text}'`;
        else condition = `checkCondition('${p.condition}')`;
        
        code += `${i}if (${condition}) {\n`;
        indentLevel++;
        break;

      case CommandType.ELSE:
        indentLevel = Math.max(0, indentLevel - 1);
        code += `${getIndent()}} else {\n`;
        indentLevel++;
        break;

      case CommandType.END_IF:
        indentLevel = Math.max(0, indentLevel - 1);
        code += `${getIndent()}}\n`;
        break;

      case CommandType.WAIT_FOR_PRESS:
        code += `${i}while(!digitalRead(4)) { await delay(100); }\n`;
        break;

      // --- APP COMMANDS ---
      case CommandType.SET_TITLE:
        code += `${i}app.setTitle("${cmd.params.text}");\n`;
        break;
      case CommandType.SET_BACKGROUND:
        code += `${i}app.setBackground("${cmd.params.color}");\n`;
        break;
      case CommandType.ADD_BUTTON:
        code += `${i}app.addButton("${cmd.params.text}", () => alert("${cmd.params.message}"));\n`;
        break;
      case CommandType.ADD_INPUT:
        code += `${i}app.addInput("${cmd.params.text}", "${cmd.params.varName}");\n`;
        break;
      case CommandType.ADD_SWITCH:
        code += `${i}app.addSwitch("${cmd.params.text}", "${cmd.params.varName}");\n`;
        break;
      case CommandType.NAVIGATE:
        code += `${i}app.navigateTo("${cmd.params.text}");\n`;
        break;
      
      // --- GAME COMMANDS ---
      case CommandType.MOVE_X:
        code += `${i}sprite.x += ${cmd.params.value};\n`;
        break;
      case CommandType.MOVE_Y:
        code += `${i}sprite.y += ${cmd.params.value};\n`;
        break;
      case CommandType.SAY:
        code += `${i}sprite.say("${cmd.params.text}");\n`;
        break;
      case CommandType.SET_SCENE:
        code += `${i}game.setScene("${cmd.params.text}");\n`;
        break;
      case CommandType.SET_VELOCITY_X:
        code += `${i}sprite.vx = ${cmd.params.value};\n`;
        break;
      case CommandType.SET_VELOCITY_Y:
        code += `${i}sprite.vy = ${cmd.params.value};\n`;
        break;

      // --- HARDWARE COMMANDS ---
      case CommandType.LED_ON:
        code += `${i}digitalWrite(${cmd.params.pin}, HIGH);\n`;
        break;
      case CommandType.LED_OFF:
        code += `${i}digitalWrite(${cmd.params.pin}, LOW);\n`;
        break;
      case CommandType.PLAY_TONE:
        code += `${i}tone(SPEAKER_PIN, 440, ${(cmd.params.duration || 0.5) * 1000});\n`;
        break;
      case CommandType.PLAY_SOUND:
        code += `${i}speaker.playEffect("${cmd.params.text}");\n`;
        break;
      case CommandType.SET_FAN:
        code += `${i}analogWrite(FAN_PIN, ${Math.floor((cmd.params.speed || 0) * 2.55)});\n`;
        break;
      case CommandType.SET_SERVO:
        code += `${i}servo.write(${cmd.params.angle});\n`;
        break;
      case CommandType.SET_LCD:
        code += `${i}lcd.setCursor(${cmd.params.col || 0}, ${cmd.params.row || 0});\n`;
        code += `${i}lcd.print("${cmd.params.text}");\n`;
        break;
      case CommandType.CLEAR_LCD:
        code += `${i}lcd.clear();\n`;
        break;
      case CommandType.LOG_DATA:
        code += `${i}${mode === AppMode.HARDWARE ? 'Serial.println' : 'console.info'}("${cmd.params.text}");\n`;
        break;
      case CommandType.CONNECT_WIFI:
        code += `${i}// Connect to WiFi network\n`;
        code += `${i}WiFi.begin("${cmd.params.ssid || 'NETWORK_NAME'}", "${cmd.params.password || ''}");\n`;
        code += `${i}while (WiFi.status() != WL_CONNECTED) {\n`;
        code += `${i}  delay(1000);\n`;
        code += `${i}  Serial.println("Connecting to WiFi...");\n`;
        code += `${i}}\n`;
        code += `${i}Serial.println("WiFi connected successfully");\n`;
        break;
      case CommandType.SEND_HTTP:
        code += `${i}// Send HTTP request\n`;
        code += `${i}if (WiFi.status() == WL_CONNECTED) {\n`;
        code += `${i}  HTTPClient http;\n`;
        code += `${i}  http.begin("${cmd.params.url || 'http://example.com'}");\n`;
        code += `${i}  int httpResponseCode = http.GET();\n`;
        code += `${i}  if (httpResponseCode > 0) {\n`;
        code += `${i}    String response = http.getString();\n`;
        code += `${i}    Serial.println(response);\n`;
        code += `${i}  }\n`;
        code += `${i}  http.end();\n`;
        code += `${i}}\n`;
        break;

      // --- DATA & MATH ---
      case CommandType.SET_VAR:
        code += `${i}${cmd.params.varName} = ${cmd.params.value};\n`;
        break;
      case CommandType.CHANGE_VAR:
        code += `${i}${cmd.params.varName} += ${cmd.params.value};\n`;
        break;
      
      // Math
      case CommandType.CALC_ADD:
        code += `${i}${cmd.params.varName} = ${cmd.params.value} + ${cmd.params.value2};\n`;
        break;
      case CommandType.CALC_SUB:
        code += `${i}${cmd.params.varName} = ${cmd.params.value} - ${cmd.params.value2};\n`;
        break;
      case CommandType.CALC_MUL:
        code += `${i}${cmd.params.varName} = ${cmd.params.value} * ${cmd.params.value2};\n`;
        break;
      case CommandType.CALC_DIV:
        code += `${i}${cmd.params.varName} = ${cmd.params.value} / ${cmd.params.value2};\n`;
        break;
      case CommandType.CALC_MOD:
        code += `${i}${cmd.params.varName} = ${cmd.params.value} % ${cmd.params.value2};\n`;
        break;
      case CommandType.CALC_SIN:
        code += `${i}${cmd.params.varName} = Math.sin(${cmd.params.value});\n`;
        break;
      case CommandType.CALC_COS:
        code += `${i}${cmd.params.varName} = Math.cos(${cmd.params.value});\n`;
        break;
      case CommandType.CALC_RANDOM:
        code += `${i}${cmd.params.varName} = random(${cmd.params.value}, ${cmd.params.value2});\n`;
        break;

      // Strings
      case CommandType.STR_JOIN:
        code += `${i}${cmd.params.varName} = "${cmd.params.text}" + "${cmd.params.text2}";\n`;
        break;
      case CommandType.STR_LENGTH:
        code += `${i}${cmd.params.varName} = "${cmd.params.text}".length;\n`;
        break;
      case CommandType.STR_UPPER:
        code += `${i}${cmd.params.varName} = "${cmd.params.text}".toUpperCase();\n`;
        break;

      // Lists
      case CommandType.LIST_ADD:
        code += `${i}${cmd.params.varName}.push("${cmd.params.value}");\n`;
        break;
      case CommandType.LIST_REMOVE:
        code += `${i}${cmd.params.varName}.splice(${cmd.params.value}, 1);\n`;
        break;
      case CommandType.LIST_GET:
        code += `${i}${cmd.params.varName} = ${cmd.params.listName}[${cmd.params.value}];\n`;
        break;
      case CommandType.LIST_CLEAR:
        code += `${i}${cmd.params.varName} = [];\n`;
        break;

      // --- LOCAL DATABASE ---
      case CommandType.DB_CREATE:
        code += `${i}const ${cmd.params.varName || 'db'} = createTable("${cmd.params.text || 'data'}", [${cmd.params.text2 || '"id", "name", "value"'}]);\n`;
        break;
      case CommandType.DB_INSERT:
        code += `${i}${cmd.params.varName || 'db'}.insert({ ${cmd.params.text || 'name: "item", value: 0'} });\n`;
        break;
      case CommandType.DB_QUERY:
        code += `${i}${cmd.params.listName || 'results'} = ${cmd.params.varName || 'db'}.select().where("${cmd.params.condition || 'id > 0'}").all();\n`;
        break;
      case CommandType.DB_UPDATE:
        code += `${i}${cmd.params.varName || 'db'}.update({ ${cmd.params.text || 'value: 1'} }).where("${cmd.params.condition || 'id = 1'}");\n`;
        break;
      case CommandType.DB_DELETE:
        code += `${i}${cmd.params.varName || 'db'}.delete().where("${cmd.params.condition || 'id = 1'}");\n`;
        break;
      case CommandType.DB_SELECT:
        code += `${i}${cmd.params.listName || 'results'} = ${cmd.params.varName || 'db'}.select("${cmd.params.text || '*'}").all();\n`;
        break;
      case CommandType.DB_COUNT:
        code += `${i}${cmd.params.listName || 'count'} = ${cmd.params.varName || 'db'}.count();\n`;
        break;
      case CommandType.DB_CLEAR:
        code += `${i}${cmd.params.varName || 'db'}.clear();\n`;
        break;

      // --- FORM VALIDATION ---
      case CommandType.VALIDATE_EMAIL:
        code += `${i}${cmd.params.listName || 'isValid'} = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(${cmd.params.varName || 'email'});\n`;
        break;
      case CommandType.VALIDATE_NUMBER:
        code += `${i}${cmd.params.listName || 'isValid'} = !isNaN(${cmd.params.varName || 'value'}) && ${cmd.params.varName || 'value'} >= ${(cmd.params.value || 0)} && ${cmd.params.varName || 'value'} <= ${(cmd.params.value2 || 100)};\n`;
        break;
      case CommandType.VALIDATE_PASSWORD:
        code += `${i}${cmd.params.listName || 'isValid'} = ${cmd.params.varName || 'password'}.length >= ${(cmd.params.value || 8)};\n`;
        break;
      case CommandType.VALIDATE_REQUIRED:
        code += `${i}${cmd.params.listName || 'isValid'} = ${cmd.params.varName || 'value'} !== null && ${cmd.params.varName || 'value'} !== undefined && String(${cmd.params.varName || 'value'}).trim() !== "";\n`;
        break;
      case CommandType.VALIDATE_LENGTH:
        code += `${i}${cmd.params.listName || 'isValid'} = ${cmd.params.varName || 'text'}.length >= ${(cmd.params.value || 1)} && ${cmd.params.varName || 'text'}.length <= ${(cmd.params.value2 || 255)};\n`;
        break;

      // --- DEVICE SENSORS ---
      case CommandType.READ_ACCELEROMETER:
        code += `${i}${cmd.params.varName || 'accel'} = await getAccelerometer();\n`;
        break;
      case CommandType.READ_GYROSCOPE:
        code += `${i}${cmd.params.varName || 'gyro'} = await getGyroscope();\n`;
        break;
      case CommandType.READ_DEVICE_COMPASS:
        code += `${i}${cmd.params.varName || 'heading'} = await getDeviceCompass();\n`;
        break;

      // --- PUSH NOTIFICATIONS ---
      case CommandType.PUSH_NOTIFICATION:
        code += `${i}sendPushNotification("${cmd.params.text || 'Notification'}", "${cmd.params.message || 'You have a new message'}");\n`;
        break;

      // --- CUSTOM FONTS ---
      case CommandType.SET_FONT:
        code += `${i}app.setFont("${cmd.params.text || 'Roboto'}");\n`;
        break;

      // --- CHART DATA ---
      case CommandType.SET_CHART_DATA:
        code += `${i}${cmd.params.varName || 'chartData'} = ${cmd.params.text || '[10, 20, 30, 40, 50]'};\n`;
        break;

      default:
        code += `${i}// ${cmd.type}\n`;
        break;
    }
  });

  // Footer
  if (mode === AppMode.HARDWARE) {
     indentLevel = 0;
     code += `}\n`;
  } else {
     indentLevel = 0;
     code += `}\n`;
  }

  return { code, errors: [] };
};
