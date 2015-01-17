#include <pebble.h>

// action_window.c
void action_window_init(int app_num);

// app_msg.c
void app_message_init();
void send_command(char* app, char* button);

typedef enum {
  KEY_APP_1 = 0x0,
  KEY_APP_2 = 0x1,
  KEY_APP_3 = 0x2,
  KEY_APP_4 = 0x3,
  KEY_APP_5 = 0x4,
  KEY_APP_6 = 0x5,
  KEY_APP_7 = 0x6,
  KEY_APP_8 = 0x7,
  KEY_APP_COUNT = 0x8,
  KEY_COMMAND_APP = 0x9,
  KEY_COMMAND_BUTTON = 0xA,
  KEY_TEXT_MAIN = 0xB,
  KEY_TEXT_HEADER = 0xC
} MessageKey;

