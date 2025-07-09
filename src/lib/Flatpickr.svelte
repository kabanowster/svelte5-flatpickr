<script lang="ts">
    import flatpickr from "flatpickr";
    import {onMount} from "svelte";
    import {addDays, compareAsc} from "date-fns";

    let {options, value = $bindable(), rangeDelimiter, noEndDateRender, noStartDateRender, returnAllDatesWithinRange, ...attrs}: {
        options: object,
        value?: Date | Date[] | string | null,
        class?: string,
        style?: string,
        name?: string,
        id?: string,
        placeholder?: string,
        required?: boolean,
        rangeDelimiter?: string,
        noEndDateRender?: boolean,
        noStartDateRender?: boolean,
        returnAllDatesWithinRange?: boolean,
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

    const defaultRangeDelimiter = " - ";

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
        fp.config.onChange.push((dates: Date[]) => {
            if (dates.length === 0) {
                value = [];
                return;
            }

            if (dates.length === 2 && returnAllDatesWithinRange) {
                value = getDatesBetween(dates)
            } else {
                value = dates;
            }
        });

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
                const parsedRange = value.split(rangeDelimiter ?? defaultRangeDelimiter, 2);
                if (parsedRange.length === 2) {
                    dates = [new Date(parsedRange[0]), new Date(parsedRange[1])];
                } else {
                    dates = [new Date(parsedRange[0])];
                }
            }
        } else {
            dates = value ? Array.isArray(value) ? value : [value] : [];
        }

        fp.setDate(dates.length > 1 ? [dates[0], dates[dates.length - 1]] : dates, false);

        switch (dates.length) {
            case 0:
                inputValue = null;
                break;
            case 1:
                inputValue = formatInput(dates[0]);
                break;
            default:
                inputValue = (noStartDateRender ? "" : formatInput(dates[0])) + (rangeDelimiter ?? defaultRangeDelimiter) + (noEndDateRender ? "" : formatInput(dates[dates.length - 1]))
        }

    })

    function formatInput(date: Date): string | null {
        if (!fp || !date) return null;
        return fp.config.formatDate ? fp.config.formatDate(date) : flatpickr.formatDate(date, fp.config.dateFormat);
    }

    function getDatesBetween(dates?: { startDate: Date; endDate: Date } | Date[]): Date[] {
        if (!dates) return [];
        let startDate: Date;
        let endDate: Date;

        if (Array.isArray(dates)) {
            if (dates.length !== 2) return [];
            dates.sort((a, b) => compareAsc(a, b));
            startDate = dates[0];
            endDate = dates[1];
        } else {
            if (dates.startDate == null || dates.endDate == null || dates.endDate < dates.startDate)
                return [];
            startDate = dates.startDate;
            endDate = dates.endDate;
        }

        const returnDates: Date[] = [];
        let currentDate = new Date(startDate);

        while (compareAsc(currentDate, endDate) < 1) {
            returnDates.push(currentDate);
            currentDate = addDays(currentDate, 1);
        }

        return returnDates;
    }
</script>

<input type="text"
       style="cursor: pointer !important;"
       bind:this={input}
       bind:value={inputValue}
       {...attrs}/>