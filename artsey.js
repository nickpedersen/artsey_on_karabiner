const fs = require("fs");

// Config, change these before running
const path = "../../.config/karabiner/karabiner.json"; // Path to your Karabiner.json usually ~/.config/karabiner/karabiner.json

const profile = "Artsey"; // Profile name in Karabiner, will be overwritten if it exists

const layerHold = 250; // How long required to trigger a hold layer

// Keys to use on your keyboard. 1 is A, 2 is R, 3 is T, 4 is S, 5 is E, 6 is Y, 7 is I, 8 is O
const bindings = {
  1: "f",
  2: "d",
  3: "s",
  4: "a",
  5: "v",
  6: "c",
  7: "x",
  8: "z",
};

const globals = {
  return_or_enter: [1, 5],
  spacebar: [5, 6, 7, 8],
  delete_or_backspace: [2, 5],
  escape: [1, 2, 8],
  tab: [1, 2, 3, 8],
  quote: [1, 7],
  period: [1, 6],
  comma: [1, 7],
  slash: [1, 8],
  caps_lock: [1, 6, 7, 8],
  "!": [3, 7],
};

const alphas = {
  a: [1],
  b: [5, 8],
  c: [5, 6],
  d: [1, 2, 3],
  e: [5],
  f: [1, 2],
  g: [2, 3],
  h: [5, 7],
  i: [7],
  j: [3, 4],
  k: [6, 8],
  l: [5, 6, 7],
  m: [6, 7, 8],
  n: [7, 8],
  o: [8],
  p: [5, 7, 8],
  q: [1, 3, 4],
  r: [2],
  s: [4],
  t: [3],
  u: [6, 7],
  v: [2, 4],
  w: [1, 4],
  x: [2, 3, 4],
  y: [6],
  z: [1, 2, 3, 4],
};

const oneShots = {
  left_shift: [2, 3, 4, 5],
  left_gui: [4, 6],
  left_control: [4, 5],
  left_alt: [4, 7],
};

const layers = {
  numbers: {
    trigger: 4,
    map: {
      1: [1],
      2: [2],
      3: [3],
      4: [5],
      5: [6],
      6: [7],
      7: [1, 2],
      8: [2, 3],
      9: [5, 6],
      0: [6, 7],
      vk_none: [8],
    },
  },
  symbols: {
    trigger: 1,
    map: {
      ")": [2],
      "(": [3],
      "{": [4],
      "]": [6],
      "[": [7],
      "}": [8],
      vk_none: [5],
    },
  },
  symbols2: {
    trigger: 5,
    map: {
      "`": [4],
      ";": [3],
      "\\": [2],
      "!": [1],
      "=": [8],
      "-": [7],
      "?": [6],
    },
  },
  custom: {
    trigger: 8,
    map: {
      mute: [1],
      volume_increment: [3],
      volume_decrement: [7],
      vk_none: [4],
    },
  },
};

const lockLayers = {
  nav: {
    trigger: [2, 5, 7],
    map: {
      up_arrow: [2],
      down_arrow: [6],
      left_arrow: [7],
      right_arrow: [5],
    },
  },
};

const existing = JSON.parse(fs.readFileSync(path));

const output = {};
output.complex_modifications = {
  parameters: {
    "basic.simultaneous_threshold_milliseconds": 100,
    "basic.to_delayed_action_delay_milliseconds": 500,
    "basic.to_if_alone_timeout_milliseconds": 1000,
    "basic.to_if_held_down_threshold_milliseconds": 500,
    "mouse_motion_to_scroll.speed": 100,
  },
  rules: [],
};
output.devices = [];
output.fn_function_keys = [];
output.name = profile;
output.selected = true;
output.parameters = {
  delay_milliseconds_before_open_device: 1000,
};
output.simple_modifications = [];
output.virtual_hid_keyboard = {
  country_code: 0,
  indicate_sticky_modifier_keys_state: true,
  mouse_key_xy_scale: 100,
};

const oldArtseyLayoutIx = existing.profiles.findIndex(
  (p) => p.name === profile
);

if (oldArtseyLayoutIx > -1) {
  delete existing.profiles[oldArtseyLayoutIx];
}

// Capslock to toggle
output.complex_modifications.rules.push({
  description: `capslock disable`,
  manipulators: [
    {
      conditions: [
        {
          type: "variable_if",
          name: `disable_artsey`,
          value: 0,
        },
      ],
      from: {
        key_code: "caps_lock",
      },
      to: [
        {
          set_variable: {
            name: `disable_artsey`,
            value: 1,
          },
        },
      ],
      type: "basic",
    },
  ],
});

output.complex_modifications.rules.push({
  description: `capslock enable`,
  manipulators: [
    {
      conditions: [
        {
          type: "variable_if",
          name: `disable_artsey`,
          value: 1,
        },
      ],
      from: {
        key_code: "caps_lock",
      },
      to: [
        {
          set_variable: {
            name: `disable_artsey`,
            value: 0,
          },
        },
      ],
      type: "basic",
    },
  ],
});

// Lock Layer triggers
Object.entries(lockLayers).forEach(([layer, { trigger }]) => {
  mapKey(trigger, null, { isLockLayer: true, layer });
});

// Add globals
Object.entries(globals)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([to, from]) => {
    mapKey(from, to, { enableOneShots: true });
  });

Object.entries(oneShots).forEach(([to, from]) => {
  mapKey(from, to, { isOneShot: true });
});

// layers
Object.entries(layers).forEach(([layer, { trigger, map }]) => {
  // cancel
  mapKey([trigger], null, { isCancel: true, layer });

  Object.entries(map)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([to, from]) => {
      mapKey(from, to, { enableOneShots: true, layer });
    });
});

// lock layers
Object.entries(lockLayers).forEach(([layer, { trigger, map }]) => {
  Object.entries(map)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([to, from]) => {
      mapKey(from, to, { enableOneShots: true, layer });
    });
});

// Add alphas
Object.entries(alphas)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([to, from]) => {
    mapKey(from, to, { enableOneShots: true, enableLayerHold: true });
  });

// Void covered keys
[
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
].forEach((from) => {
  const boundKeys = Object.values(bindings);
  if (!boundKeys.includes(from)) {
    mapKey([from], "vk_none", { useRawKeys: true });
  }
});

existing.profiles.push(output);

existing.profiles = existing.profiles.filter((p) => !!p);

fs.writeFileSync(path, JSON.stringify(existing, null, 2));

// General rule builder
function mapKey(
  from,
  to,
  {
    enableOneShots,
    enableLayerHold,
    useRawKeys,
    layer,
    isOneShot,
    isCancel,
    isLockLayer,
  } = {}
) {
  const fromKeys = from.map((f) => (useRawKeys ? f : bindings[f]));

  const conditions = [
    {
      type: "variable_if",
      name: `disable_artsey`,
      value: 0,
    },
  ];

  if (isLockLayer) {
    output.complex_modifications.rules.push({
      description: `Enable ${layer}`,
      manipulators: [
        {
          conditions: [
            ...conditions,
            {
              type: "variable_if",
              name: `layer_${layer}`,
              value: 0,
            },
          ],
          from: {
            simultaneous: fromKeys.map((f) => ({ key_code: f })),
            simultaneous_options: {
              detect_key_down_uninterruptedly: false,
              key_down_order: "insensitive",
              key_up_order: "insensitive",
              key_up_when: "any",
            },
          },
          to: [
            {
              set_variable: {
                name: `layer_${layer}`,
                value: 1,
              },
            },
          ],
          type: "basic",
        },
      ],
    });
    output.complex_modifications.rules.push({
      description: `Cancel ${layer}`,
      manipulators: [
        {
          conditions: [
            ...conditions,
            {
              type: "variable_if",
              name: `layer_${layer}`,
              value: 1,
            },
          ],
          from: {
            simultaneous: fromKeys.map((f) => ({ key_code: f })),
            simultaneous_options: {
              detect_key_down_uninterruptedly: false,
              key_down_order: "insensitive",
              key_up_order: "insensitive",
              key_up_when: "any",
            },
          },
          to: [
            {
              set_variable: {
                name: `layer_${layer}`,
                value: 0,
              },
            },
          ],
          type: "basic",
        },
      ],
    });
    return;
  }

  if (layer) {
    conditions.push({
      type: "variable_if",
      name: `layer_${layer}`,
      value: 1,
    });
  }

  if (isOneShot) {
    output.complex_modifications.rules.push({
      description: `[one shot] ${to}`,
      manipulators: [
        {
          conditions: [...conditions],
          from: {
            simultaneous: fromKeys.map((f) => ({ key_code: f })),
            simultaneous_options: {
              detect_key_down_uninterruptedly: false,
              key_down_order: "insensitive",
              key_up_order: "insensitive",
              key_up_when: "any",
            },
          },
          to: [
            {
              set_variable: {
                name: `one_shot_${to}`,
                value: 1,
              },
            },
          ],
          type: "basic",
        },
      ],
    });

    return;
  }

  if (isCancel) {
    output.complex_modifications.rules.push({
      description: `Cancel ${layer}`,
      manipulators: [
        {
          conditions: [...conditions],
          from: {
            simultaneous: fromKeys.map((f) => ({ key_code: f })),
            simultaneous_options: {
              detect_key_down_uninterruptedly: false,
              key_down_order: "insensitive",
              key_up_order: "insensitive",
              key_up_when: "any",
            },
          },
          to: [
            {
              set_variable: {
                name: `layer_${layer}`,
                value: 0,
              },
            },
          ],
          type: "basic",
        },
      ],
    });
    return;
  }

  if (enableOneShots) {
    buildCombinations(Object.keys(oneShots), true).forEach((mods) => {
      output.complex_modifications.rules.push({
        description: `[${mods.join()}] ${fromKeys.join()} to ${to}`,
        manipulators: [
          {
            conditions: [
              ...conditions,
              ...mods.map((mod) => ({
                type: "variable_if",
                name: `one_shot_${mod}`,
                value: 1,
              })),
            ],
            from: {
              simultaneous: fromKeys.map((f) => ({ key_code: f })),
              simultaneous_options: {
                detect_key_down_uninterruptedly: false,
                key_down_order: "insensitive",
                key_up_order: "insensitive",
                key_up_when: "any",
              },
            },
            to: [
              { ...mapTo(to)[0], modifiers: mods },

              ...mods.map((mod) => ({
                set_variable: {
                  name: `one_shot_${mod}`,
                  value: 0,
                },
              })),
            ],
            type: "basic",
          },
        ],
      });
    });
  }

  const matchingLayerIx = Object.values(layers).findIndex(
    (f) => f.trigger === from[0]
  );

  if (enableLayerHold && from.length === 1 && matchingLayerIx > -1) {
    output.complex_modifications.rules.push({
      description: `${fromKeys.join()} to ${to} lAyer`,
      manipulators: [
        {
          conditions: [...conditions],
          from: {
            key_code: fromKeys[0],
          },
          to_if_alone: mapTo(to),
          to_if_held_down: [
            {
              set_variable: {
                name: `layer_${Object.keys(layers)[matchingLayerIx]}`,
                value: 1,
              },
            },
          ],
          parameters: {
            "basic.to_if_alone_timeout_milliseconds": layerHold,
            "basic.to_if_held_down_threshold_milliseconds": layerHold,
          },
          type: "basic",
        },
      ],
    });
  } else {
    output.complex_modifications.rules.push({
      description: `${fromKeys.join()} to ${to}`,
      manipulators: [
        {
          conditions: [...conditions],
          from: {
            simultaneous: fromKeys.map((f) => ({ key_code: f })),
            simultaneous_options: {
              detect_key_down_uninterruptedly: false,
              key_down_order: "insensitive",
              key_up_order: "insensitive",
              key_up_when: "any",
            },
          },
          to: mapTo(to),
          type: "basic",
        },
      ],
    });
  }
}

// Used to map shifted symbols mainly
function mapTo(key) {
  if (key === "{") {
    return [
      {
        key_code: "open_bracket",
        modifiers: ["left_shift"],
      },
    ];
  } else if (key === "}") {
    return [
      {
        key_code: "close_bracket",
        modifiers: ["left_shift"],
      },
    ];
  } else if (key === "[") {
    return [
      {
        key_code: "open_bracket",
      },
    ];
  } else if (key === "]") {
    return [
      {
        key_code: "close_bracket",
      },
    ];
  } else if (key === "(") {
    return [
      {
        key_code: "9",
        modifiers: ["left_shift"],
      },
    ];
  } else if (key === ")") {
    return [
      {
        key_code: "0",
        modifiers: ["left_shift"],
      },
    ];
  } else if (key === "`") {
    return [
      {
        key_code: "grave_accent_and_tilde",
      },
    ];
  } else if (key === ";") {
    return [
      {
        key_code: "semicolon",
      },
    ];
  } else if (key === "\\") {
    return [
      {
        key_code: "backslash",
      },
    ];
  } else if (key === "!") {
    return [
      {
        key_code: "1",
        modifiers: ["left_shift"],
      },
    ];
  } else if (key === "=") {
    return [
      {
        key_code: "equal_sign",
      },
    ];
  } else if (key === "-") {
    return [
      {
        key_code: "hyphen",
      },
    ];
  } else if (key === "?") {
    return [
      {
        key_code: "slash",
        modifiers: ["left_shift"],
      },
    ];
  }
  return [
    {
      key_code: key,
    },
  ];
}

function buildCombinations(inputs, ignoreEmpty) {
  let result = [];
  for (let i = 0; i < 2 ** inputs.length; i++) {
    const combo = i.toString(2).padStart(inputs.length, "0").split("");
    result.push(inputs.filter((k, ix) => combo[ix] === "1"));
  }

  return ignoreEmpty
    ? result.filter((k) => k.length > 0).sort((a, b) => b.length - a.length)
    : result.sort((a, b) => b[1].length - a[1].length);
}
