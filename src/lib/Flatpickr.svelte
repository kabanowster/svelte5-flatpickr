<script lang="ts">
    import {onMount} from "svelte";
    import {addDays, compareAsc} from "date-fns";
    import flatpickr from "flatpickr";

    let {options, value = $bindable(), rangeDelimiter, noEndDateRender, noStartDateRender, returnAllDatesWithinRange, ...attrs}: {
        options: flatpickr.default.Options.Options,
        value?: Date | Date[] | string | null,
        class?: string,
        style?: string,
        name?: string,
        id?: string,
        placeholder?: string,
        required?: boolean,
        readonly?: boolean,
        disabled?: boolean,
        form?: string,
        rangeDelimiter?: string,
        noEndDateRender?: boolean,
        noStartDateRender?: boolean,
        returnAllDatesWithinRange?: boolean
    } = $props();

    let fp: flatpickr.default.Instance;
    let input: HTMLInputElement;
    let inputValue: string | null | undefined = $state(undefined);

    const defaultRangeDelimiter = " - ";
    const isAccessible = $derived(!attrs.disabled && !attrs.readonly);

    onMount(() => {
        fp = flatpickr(input, options);

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

    $effect(() => {
        const key = "clickOpens"
        if (!isAccessible) {
            fp.set(key, false);
        } else {
            if (options[key]) {
                fp.set(key, options[key]);
            } else {
                fp.set(key, true);
            }
        }
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
        return fp.config.formatDate ? fp.config.formatDate(date, fp.config.dateFormat, fp.config.locale as flatpickr.default.Locale) : fp.formatDate(date, fp.config.dateFormat);
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
           class:enabled="{isAccessible}"
           class:disabled="{!isAccessible}"
           bind:this={input}
           bind:value={inputValue}
           {...attrs}/>

<style>
    .enabled {
        cursor: pointer !important;
    }

    .disabled {
        cursor: default !important;
    }
</style>