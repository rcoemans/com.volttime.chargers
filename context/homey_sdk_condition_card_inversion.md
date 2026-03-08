# Homey SDK v3 -- Condition Card Inversion Text

## Overview

In **Homey SDK v3**, Flow **Condition cards** can automatically change
their title when the card is **inverted** in a Flow.

For example, the built‑in Homey card:

`[Text, Number] is exactly [value]`

will automatically become:

`[Text, Number] is not exactly [value]`

when the card is inverted.

When developing your own Homey app, you can implement this behaviour
directly in the **Flow card title definition**.

------------------------------------------------------------------------

# Inversion Syntax

Homey supports a special syntax for conditional card titles:

    !{{normal text|inverted text}}

-   **normal text** → shown when the condition card is used normally
-   **inverted text** → shown when the card is inverted in the Flow
    editor

This syntax can be used inside the `title` or `titleFormatted` fields of
a Flow card definition.

------------------------------------------------------------------------

# Basic Example

Example card title:

``` json
{
  "title": {
    "en": "COP !{{is|is not}} [Operator] [Value]"
  }
}
```

This results in:

Normal card:

    COP is greater than 3

Inverted card:

    COP is not greater than 3

------------------------------------------------------------------------

# Example with Flow Arguments

When your card contains arguments, you normally use **titleFormatted**
because it allows argument placeholders.

Example:

``` json
{
  "title": {
    "en": "COP comparison"
  },
  "titleFormatted": {
    "en": "COP !{{is|is not}} [[operator]] [[value]]"
  },
  "args": [
    {
      "type": "dropdown",
      "name": "operator",
      "values": [
        { "id": "greater_than", "label": { "en": "greater than" } },
        { "id": "less_than", "label": { "en": "less than" } },
        { "id": "equal_to", "label": { "en": "equal to" } }
      ]
    },
    {
      "type": "number",
      "name": "value",
      "title": {
        "en": "Value"
      }
    }
  ]
}
```

Displayed in Homey Flow editor:

Normal:

    COP is greater than 3

Inverted:

    COP is not greater than 3

------------------------------------------------------------------------

# Alternative Pattern

If you only want to insert the word **Not** when inverted:

``` json
"titleFormatted": {
  "en": "COP Is !{{|Not }}[[operator]] [[value]]"
}
```

Result:

Normal:

    COP Is greater than 3

Inverted:

    COP Is Not greater than 3

------------------------------------------------------------------------

# Key Points

-   The inversion behaviour is **handled entirely by the Flow card title
    definition**
-   No additional JavaScript code is required
-   The syntax works in:
    -   `title`
    -   `titleFormatted`
-   `titleFormatted` should be used when the card includes **arguments**

------------------------------------------------------------------------

# Official Documentation

The feature is documented in the Homey developer documentation:

**Homey Apps SDK -- Flow Cards**
https://apps.developer.homey.app/the-basics/flow

The documentation explains the use of the syntax:

    !{{normal|inverted}}

Example given in the docs:

    It !{{is|isn't}} going to rain tomorrow

This text automatically changes when the condition card is inverted.

------------------------------------------------------------------------

# Summary

To support inversion text in a Homey SDK v3 **Condition card**:

1.  Define your Flow card in the app manifest or Homey Compose file.
2.  Use the inversion syntax:

```{=html}
<!-- -->
```
    !{{normal|inverted}}

3.  Place it inside `title` or `titleFormatted`.

Example:

``` json
"titleFormatted": {
  "en": "COP !{{is|is not}} [[operator]] [[value]]"
}
```

Homey will automatically switch the displayed text when the Flow card is
inverted.
