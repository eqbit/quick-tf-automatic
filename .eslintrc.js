module.exports = {
    "root": true,
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "airbnb-base"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "import/prefer-default-export": 0,
        "consistent-return": 0,
        "@typescript-eslint/ban-types": 0,
        "@typescript-eslint/explicit-module-boundary-types": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "no-console": 0,
        "import/extensions": [
            "error",
            "ignorePackages",
            {
                "js": "never",
                "jsx": "never",
                "ts": "never",
                "tsx": "never"
            }
        ],
        "implicit-arrow-linebreak": 0,
        "arrow-body-style": 0,
        "camelcase": 0,
    },
    "settings": {
        "import/resolver": {
            "node": {
                "extensions": [".js", ".ts"]
            }
        }
    }
};
