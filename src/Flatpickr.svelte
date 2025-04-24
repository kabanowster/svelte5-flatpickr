<script lang="ts">
    import flatpickr from "flatpickr";
    import {onMount} from "svelte";

    let {options, value = $bindable(), ...attrs}: {
        options: object,
        value?: Date | Date[] | string | null,
        class?: string,
        name?: string,
        id?: string,
        placeholder?: string,
        required?: boolean,
        onchange?: (event: Event) => void,
        onready?: (event: Event) => void,
        onopen?: (event: Event) => void,
        onclose?: (event: Event) => void,
        onupdate?: (event: Event) => void,
        onkeydown?: (event: Event) => void,
        onday?: (event: Event) => void,
        onmonth?: (event: Event) => void,
        onyear?: (event: Event) => void,
        ondestroy?: (event: Event) => void,
        onposition?: (event: Event) => void,
        onfocus?: (event: Event) => void,
        onblur?: (event: Event) => void,
        oninvalid?: (event: Event) => void
    } = $props();

    let fp;
    let input: Node;
    let inputValue: string | null | undefined = $state(undefined);

    const events = [
        ["ready", "onReady"],
        ["open", "onOpen"],
        ["close", "onClose"],
        ["change", "onChange"],
        ["update", "onValueUpdate"],
        ["keydown", "onKeyDown"],
        ["day", "onDayCreate"],
        ["month", "onMonthChange"],
        ["year", "onYearChange"],
        ["destroy", "onDestroy"],
        ["position", "onPreCalendarPosition"]
    ];

    onMount(() => {
        fp = flatpickr(input, options);

        events.forEach(([name, hook]) => fp.config[hook].push((...detail) => input.dispatchEvent(new CustomEvent(name, {detail}))));

        // update input on fp date pick
        fp.config.onChange.push((dates: Date[]) => value = dates)

        return () => fp.destroy();
    })

    // on options change
    $effect(() =>
        Object.keys(options).forEach((key) => {
            const val = options[key];
            if (fp.config[key] !== val) fp.set(key, val);
        }))

    // on value change
    $effect(() => {
        let dates: Date[] = [];

        // parse if value is string
        if (typeof value === "string") {
            if (value.length > 0) {
                const parsedRange = value.split(" - ", 2);
                if (parsedRange.length === 2) {
                    dates = [new Date(parsedRange[0]), new Date(parsedRange[1])];
                } else {
                    dates = [new Date(parsedRange[0])];
                }
            }
        } else {
            dates = value ? Array.isArray(value) ? value : [value] : [];
        }

        fp.setDate(dates, false);

        switch (dates.length) {
            case 0:
                inputValue = null;
                break;
            case 1:
                inputValue = formatInput(dates[0]);
                break;
            default:
                inputValue = formatInput(dates[0]) + " - " + formatInput(dates[dates.length - 1]);
        }

    })

    function formatInput(date: Date): string | null {
        if (!fp || !date) return null;
        return fp.config.formatDate ? fp.config.formatDate(date) : flatpickr.formatDate(date, fp.config.dateFormat);
    }
</script>

<input type="text"
       style="cursor: pointer !important;"
       bind:this={input}
       bind:value={inputValue}
       {...attrs}/>
