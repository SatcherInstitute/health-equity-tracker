import { ListSubheader } from '@mui/material'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useSyncExternalStore,
} from 'react'
import { List, type RowComponentProps, useListCallbackRef } from 'react-window'
import type { Fips } from '../../data/utils/Fips'
import { useIsBreakpointAndUp } from '../../utils/hooks/useIsBreakpointAndUp'

// renderOption returns [liProps, fips] and renderGroup returns its params
// untouched; this component receives them via children and renders the rows
// itself so only the visible slice of ~3,000 options is mounted.
export type VirtualizedOptionTuple = [
  HTMLAttributes<HTMLLIElement> & { key: string },
  Fips,
]

interface VirtualizedGroupParams {
  key: string
  group: string
  children?: ReactNode
}

export interface ListboxHighlight {
  code: string
  keyboard: boolean
}

interface ListboxSyncValue {
  highlighted: ListboxHighlight | null
  inputValue: string
}

// Plain external store instead of React state: setting state in the
// Autocomplete's parent on every onHighlightChange re-renders useAutocomplete,
// whose filteredOptionsChanged effect then re-runs syncHighlightedIndex and,
// with no selected value, resets the highlight to the top. Only this listbox
// subscribes, so highlight moves never re-render the Autocomplete itself.
export interface ListboxSyncStore {
  getSnapshot: () => ListboxSyncValue
  subscribe: (onChange: () => void) => () => void
  update: (next: Partial<ListboxSyncValue>) => void
}

export function createListboxSyncStore(): ListboxSyncStore {
  let value: ListboxSyncValue = { highlighted: null, inputValue: '' }
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => value,
    subscribe: (onChange) => {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    update: (next) => {
      value = { ...value, ...next }
      for (const onChange of listeners) {
        onChange()
      }
    },
  }
}

export const ListboxSyncContext = createContext<ListboxSyncStore>(
  createListboxSyncStore(),
)

const HEADER_HEIGHT = 48
const OPTION_HEIGHT_SM_AND_UP = 36
const OPTION_HEIGHT_PHONE = 48
const VISIBLE_OPTION_ROWS = 8
const OVERSCAN_ROWS = 5

type RowData =
  | { variant: 'header'; label: string }
  | {
      variant: 'option'
      optionProps: HTMLAttributes<HTMLLIElement> & { key: string }
      fips: Fips
    }

interface RowExtraProps {
  rows: RowData[]
  offsets: number[]
  highlighted: ListboxHighlight | null
}

function Row({
  index,
  style,
  rows,
  offsets,
  highlighted,
}: RowComponentProps<RowExtraProps>) {
  const row = rows[index]
  // react-window positions rows with translateY, which leaves offsetTop at 0
  // and breaks the offsetTop-based scroll sync inside MUI useAutocomplete.
  // Explicit top offsets keep both scroll systems accurate.
  const positioned: CSSProperties = {
    ...style,
    transform: 'none',
    top: offsets[index],
  }
  if (row.variant === 'header') {
    return (
      <ListSubheader
        component='li'
        role='presentation'
        disableSticky
        style={positioned}
      >
        {row.label}
      </ListSubheader>
    )
  }
  const { key, className, ...optionProps } = row.optionProps
  // MUI applies Mui-focused imperatively, but virtualized rows can remount
  // while highlighted (scroll away and back), losing the class. Deriving it
  // from state keeps the visual highlight consistent with aria-activedescendant.
  const isHighlighted = row.fips.code === highlighted?.code
  const rowClassName = [
    className,
    isHighlighted ? 'Mui-focused' : '',
    isHighlighted && highlighted?.keyboard ? 'Mui-focusVisible' : '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <li key={key} {...optionProps} className={rowClassName} style={positioned}>
      <span className='min-w-0 overflow-hidden text-ellipsis whitespace-nowrap'>
        {row.fips.getFullDisplayName()}
      </span>
    </li>
  )
}

const VirtualizedListbox = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function VirtualizedListbox(props, ref) {
    const { children, className, style, ...other } = props
    const store = useContext(ListboxSyncContext)
    const { highlighted, inputValue } = useSyncExternalStore(
      store.subscribe,
      store.getSnapshot,
    )
    const isSmAndUp = useIsBreakpointAndUp('sm')
    // Matches the MuiAutocomplete-option min-height breakpoint so touch
    // targets stay 48px on phones.
    const optionHeight = isSmAndUp
      ? OPTION_HEIGHT_SM_AND_UP
      : OPTION_HEIGHT_PHONE

    const { rows, offsets, totalHeight } = useMemo(() => {
      const flattened: RowData[] = []
      const childrenArray = Array.isArray(children)
        ? children
        : children
          ? [children]
          : []
      for (const group of childrenArray as VirtualizedGroupParams[]) {
        flattened.push({ variant: 'header', label: group.group })
        for (const [optionProps, fips] of (group.children ??
          []) as VirtualizedOptionTuple[]) {
          flattened.push({ variant: 'option', optionProps, fips })
        }
      }
      const rowOffsets: number[] = []
      let y = 0
      for (const row of flattened) {
        rowOffsets.push(y)
        y += row.variant === 'header' ? HEADER_HEIGHT : optionHeight
      }
      return { rows: flattened, offsets: rowOffsets, totalHeight: y }
    }, [children, optionHeight])

    // Callback-ref state so the forwarded ref re-fires once the list element
    // actually exists; MUI useAutocomplete queries options through this DOM
    // ref and re-syncs its highlight when the ref attaches. Key the handle on
    // the element, not the api object: react-window recreates the api after
    // measuring, and a ref re-fire makes MUI reset the highlight to the top.
    const [listApi, setListApi] = useListCallbackRef(null)
    const listElement = listApi?.element ?? null
    useImperativeHandle(ref, () => listElement as HTMLElement, [listElement])

    // Typing changes the result set and autoHighlight moves back to the
    // first option, so snap the scroll window back to the top. Keys off the
    // query text only; rows identity changes every render.
    useEffect(() => {
      if (rows.length > 0) {
        listApi?.scrollToRow({ index: 0, behavior: 'instant' })
      }
    }, [inputValue, listApi, rows.length])

    // Keyboard highlight moves (including wrap-around) must keep the
    // highlighted row mounted so aria-activedescendant resolves.
    // Guard on keyboard flag to avoid scrolling on mouse hover.
    useEffect(() => {
      if (!highlighted?.keyboard) return
      const index = rows.findIndex(
        (row) => row.variant === 'option' && row.fips.code === highlighted.code,
      )
      if (index >= 0) {
        listApi?.scrollToRow({
          index,
          align: 'smart',
          behavior: 'instant',
        })
      }
    }, [highlighted, rows, listApi])

    const height = Math.min(
      totalHeight,
      HEADER_HEIGHT + VISIBLE_OPTION_ROWS * optionHeight,
    )

    return (
      <List
        listRef={setListApi}
        rowComponent={Row}
        rowCount={rows.length}
        rowHeight={(index: number) =>
          rows[index].variant === 'header' ? HEADER_HEIGHT : optionHeight
        }
        rowProps={{ rows, offsets, highlighted }}
        overscanCount={OVERSCAN_ROWS}
        tagName='ul'
        defaultHeight={height}
        className={className}
        style={{ height, paddingTop: 0, paddingBottom: 0, ...style }}
        {...other}
      />
    )
  },
)

export default VirtualizedListbox
