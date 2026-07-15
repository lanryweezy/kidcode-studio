# Electronics Module Documentation

KidCode Studio's electronics subsystem provides a complete circuit simulation environment for learning electronics fundamentals.

## Components

### Power Sources
| Component | Voltage | Resistance | Notes |
|-----------|---------|------------|-------|
| BATTERY_9V | 9.0V | 1.0Ω | Standard 9V battery |
| BATTERY_AA | 1.5V | 0.5Ω | Single AA cell |
| SOLAR | 5.0V | 2.0Ω | Solar panel (5V) |

### LEDs
| Component | Forward Voltage | Max Current | Resistance |
|-----------|----------------|-------------|------------|
| LED_RED | 1.8V | 30mA | 90Ω |
| LED_BLUE | 3.0V | 30mA | 150Ω |
| LED_GREEN | 2.2V | 30mA | 110Ω |
| LED_YELLOW | 2.0V | 30mA | 100Ω |
| LED_ORANGE | 2.0V | 30mA | 100Ω |
| LED_WHITE | 3.2V | 30mA | 160Ω |
| RGB_LED | 2.0V | 30mA | 100Ω |
| LED_INFRARED | 1.3V | 50mA | 65Ω |
| BULB | 2.5V | 500mA | 16.7Ω |

### Passive Components
| Component | Key Property | Notes |
|-----------|-------------|-------|
| RESISTOR | 1000Ω default (configurable) | Use `resistance` property |
| CAPACITOR_ELEC | 100µF | DC impedance = open circuit |
| CAPACITOR_CERAMIC | 100nF | DC impedance = open circuit |
| CAPACITOR_TANTALUM | 10µF | DC impedance = open circuit |
| WIRE_SPOOL | 0.01Ω | Near-zero resistance |

### Diodes
| Component | Forward Voltage | Notes |
|-----------|----------------|-------|
| DIODE | 0.7V | Standard silicon diode |
| DIODE_SCHOTTKY | 0.3V | Low forward voltage |
| DIODE_ZENER | 0.7V / 5.1V | Breakdown at vz |

### Transistors
| Component | Beta | Notes |
|-----------|------|-------|
| TRANSISTOR_NPN | 200 | NPN BJT |
| TRANSISTOR_PNP | 200 | PNP BJT |
| MOSFET_N | Vgs(th)=2V, Rds(on)=0.1Ω | N-channel MOSFET |
| MOSFET_P | Vgs(th)=-2V, Rds(on)=0.1Ω | P-channel MOSFET |

### Op-Amps & Regulators
| Component | Key Property | Notes |
|-----------|-------------|-------|
| OPAMP_358 | Gain=100,000 | LM358 op-amp |
| OPAMP_072 | Gain=200,000 | OP07 op-amp |
| VREG_7805 | 5.0V output | 7805 voltage regulator |
| VREG_317 | 3.3V output | LM317 adjustable regulator |
| VREG_LDO | 3.3V output | Low-dropout regulator |

### Motors & Actuators
| Component | Forward Voltage | Max Current |
|-----------|----------------|-------------|
| MOTOR_DC | 5.0V | 1.0A |
| SERVO | 5.0V | 0.5A |
| FAN | 5.0V | 0.5A |
| BUZZER | 3.0V | 0.1A |
| STEPPER | 5.0V | 1.0A |
| RELAY | 5.0V | 0.1A |

### Displays
| Component | Voltage | Notes |
|-----------|---------|-------|
| LCD | 3.3V | 16x2 LCD |
| LCD_2004 | 3.3V | 20x4 LCD |
| OLED | 3.3V | OLED display |
| SEVEN_SEGMENT | 2.0V | 7-segment LED |
| NEOPIXEL_RING | 3.3V | WS2812B LEDs |

### Communication
| Component | Voltage | Notes |
|-----------|---------|-------|
| WIFI | 3.3V | ESP8266/ESP32 WiFi |
| BLUETOOTH | 3.3V | BLE module |
| RADIO | 3.3V | RF module |
| SD_CARD | 3.3V | SD card reader |
| RTC | 3.3V | Real-time clock |

### Sensors
All sensors default to 10kΩ resistance and 3.3V forward voltage.

## Circuit Simulation

The simulator computes:
1. **Connected groups** — BFS from each component through wires
2. **Power sources** — batteries and solar panels in each group
3. **Total resistance** — series summation with component-specific modifiers
4. **Current** — Ohm's Law: I = V / R
5. **Component states** — active/inactive based on voltage and current thresholds
6. **Warnings** — LED without resistor, overcurrent, open circuit
7. **Short circuit detection** — battery connected with no load

## Sensor Simulation

Each sensor simulates real behavior with:
- **Gaussian noise** — realistic reading variation
- **Calibration** — offset and scale correction
- **Response time** — rise/fall time modeling (first-order)
- **Cross-talk** — electromagnetic interference between sensors
- **Drift** — accumulated error over time
- **Noise filtering** — exponential moving average

### Supported Sensors (20+)
Light (LDR), Temperature (TMP36), Thermistor, DHT11, DHT22, Ultrasonic (HC-SR04), Motion (PIR), Sound, Gas (MQ-2), Flame, Rain, Soil Moisture, Pressure (BMP280), Flex, Tilt, Hall Effect, Compass (HMC5883), Gyro (MPU6050), GPS (NEO-6M), Heartbeat (Pulse), Color (TCS3200), RFID (RC522), Fingerprint (R307)

## Waveform Generation

Signal types:
- **Basic**: Sine, square, triangle, sawtooth, pulse, DC
- **Noise**: White, pink (1/f), brownian (random walk)
- **Modulation**: FM (frequency modulation), AM (amplitude modulation)
- **Analysis**: FFT (Fast Fourier Transform), RMS, amplitude, frequency estimation, duty cycle, THD, SNR

## Keyboard Shortcuts (Hardware Stage)

| Key | Action |
|-----|--------|
| `W` | Toggle wiring mode |
| `V` | Toggle voltmeter mode |
| `R` | Rotate selected component |
| `Delete/Backspace` | Delete selected components |
| `Escape` | Deselect / cancel |
| `Space` | Toggle button/switch |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+C` | Copy |
| `Ctrl+V` | Paste |
| `Ctrl+D` | Duplicate |
| `Ctrl+A` | Select all |
| `Ctrl+/-` | Zoom in/out |
| `Ctrl+0` | Reset zoom |
| `?` | Show shortcuts overlay |
