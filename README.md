Myo IMU visualization on a simple HTML page
=============

## Myo Integration

NodeJS is used as backend, with communication to Thalmic Labs Myo done using websockets. IMU data is normalised and visualised using simple HTML progress bars.

**Yellow bar**: Negative values
**Green bar**: Positive values

**Zero orientation button**: Defines current Myo orientation as ground truth by adding appropriate offsets
