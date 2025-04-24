### Svelte5 flatpickr
A simple text input component utilising [flatpickr](https://flatpickr.js.org/) package for date/time picking.

#### Attributes
Set `options` for flatpickr as in official docs, can be updated during lifecycle of the component.

Bind to `value` attribute to get/set `Date / Date[] / string / null`. Although the output from flatpickr always is an array (empty for no picks).
By passing a string `value` to the component it will get parsed to range of dates (if applicable) using provided `rangeDelimiter` (" - " by default).

With `noStartDateRender` and `noEndDateRender`, in case of range selection, the output text will skip these.

`returnAllDatesWithinRange` will calculate and output to the component's `value` all dates within selected range in flatpickr (by default flatpickr outputs only begin and end dates in array).

Other attributes are passed to the input element:
`class`, `style`, `name`, `id`, `placeholder`, `required`, `onchange`, `onready`, `onopen`, `onclose`, `onupdate`, `onkeydown`, `onday`, `onmonth`, `onyear`, `ondestroy`, `onposition`, `onfocus`, `onblur`, `oninvalid`

#### Trivia
Input text is formatted (visualised) using either provided `options.formatDate` function or `options.dateFormat` string (flatpickr implementations).

Applying hiding visibility or display styles to input element and `options.inline` property to true, will solely render the calendar picker (without input element).

Tip: `noEndDateRender` with empty `rangeDelimiter` renders only begin date.

In case of parsing for `formData`/`<form>`, it is an `<input>`, type text, with value already formatted (eventualy as range). You might want to enhance your form with the component's `value` instead, or parse the output text as Date if needed.
