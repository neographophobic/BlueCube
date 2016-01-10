/*
 * ZigZag.h - ZigZag Patter for the Freetronics 4x4x4 Cube
 */
#ifndef ZigZag_h
#define ZigZag_h

#include "Arduino.h"
#include "Cube.h"

class ZigZag {
  public:
    ZigZag(Cube cube,int theDelay);
    void update(rgb_t theColour = YELLOW); 

  private:
    int _theDelay;
    Cube _cube;
    int _state;
    unsigned long _previousMillis;
};

#endif

