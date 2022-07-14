import React, { useState } from "react";
import ArrowDropUp from "@material-ui/icons/ArrowDropUp";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Fips } from "../../data/utils/Fips";
import Popover from "@material-ui/core/Popover";
import Button from "@material-ui/core/Button";
import styles from "./OptionsSelector.module.scss";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { usePopover } from "../../utils/usePopover";
import { CATEGORIES_LIST } from "../../utils/MadLibs";
import {
  Box,
  Grid,
  ListSubheader,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import { DropdownVarId } from "../../data/config/MetricConfig";
import { ListChildComponentProps, VariableSizeList } from "react-window";

function OptionsSelector(props: {
  value: string;
  options: Fips[] | string[][];
  onOptionUpdate: (option: string) => void;
}) {
  const isFips =
    props.options[0] && props.options[0] instanceof Fips ? true : false;

  // const Row = ({ index, style }: { index: number; style: any }) => {

  //   if (!isFips) return null

  //   const placeFips = props.options[index] as Fips;

  //   return placeFips ? (
  //     <div style={style}>{placeFips.getDisplayName()}</div>
  //   ) : (
  //     <></>
  //   );
  // };

  // function WindowedLocationList() {
  //   return <VariableSizeList itemCount={props.options.length} estimatedItemSize={100} height={500} width={300} itemSize={() => 50} >
  //     {Row}
  //   </VariableSizeList>
  // }

  const popover = usePopover();

  let currentDisplayName;
  if (isFips) {
    currentDisplayName = new Fips(props.value).getFullDisplayName();
  } else {
    const chosenOption = (props.options as string[][]).find(
      (i: string[]) => i[0] === props.value
    );
    currentDisplayName = chosenOption ? chosenOption[1] : "";
  }

  const [, setTextBoxValue] = useState("");
  const updateTextBox = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextBoxValue(event.target.value);
  };

  const [autoCompleteOpen, setAutoCompleteOpen] = useState(false);
  const openAutoComplete = () => {
    setAutoCompleteOpen(true);
  };
  const closeAutoComplete = () => {
    setAutoCompleteOpen(false);
  };

  function getGroupName(option: Fips): string {
    if (option.isUsa()) return "National";
    if (option.isState()) return "States";
    if (option.isTerritory()) return "Territories";
    if (option.isCounty() && option.getParentFips().isState())
      return `${option.getParentFips().getDisplayName()} Counties`;
    if (option.isCounty() && option.getParentFips().isTerritory())
      return `${option.getParentFips().getDisplayName()} County Equivalents`;
    if (option.isCity())
      return `Cities in ${option.getParentFips().getDisplayName()}`;
    return "";
  }

  return (
    <>
      {/* <WindowedLocationList /> */}
      <Button
        variant="text"
        aria-haspopup="true"
        className={styles.MadLibButton}
        onClick={popover.open}
      >
        {currentDisplayName}{" "}
        {popover.isOpen ? <ArrowDropUp /> : <ArrowDropDown />}
      </Button>

      <Popover
        className={styles.PopoverOverride}
        aria-expanded="true"
        open={popover.isOpen}
        anchorEl={popover.anchor}
        onClose={popover.close}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {isFips && (
          <div className={styles.OptionsSelectorPopover}>
            <span className={styles.SearchForText}>Search for location</span>

            {/* <Autocomplete
              
              // TODO: Post React 18 update - validate this conversion, look like a hidden bug
              
            /> */}

            <Autocomplete
              disableClearable={true}
              disableListWrap
              // autoHighlight={true}
              options={props.options as Fips[]}
              groupBy={(option) => getGroupName(option)}
              clearOnEscape={true}
              getOptionLabel={(fips) => fips.getFullDisplayName()}
              getOptionSelected={(fips) => fips.code === props.value}
              renderOption={(props, option) =>
                [props, option] as React.ReactNode
              }
              // renderOption={(fips) => <>{fips.getFullDisplayName()}</>}
              renderGroup={(params) => params as unknown as React.ReactNode}
              open={autoCompleteOpen}
              onOpen={openAutoComplete}
              onClose={closeAutoComplete}
              ListboxComponent={ListboxComponent}
              renderInput={(params) => (
                <TextField
                  placeholder="County, State, Territory, or United States"
                  margin="dense"
                  variant="outlined"
                  onChange={updateTextBox}
                  {...params}
                />
              )}
              onChange={(e, fips) => {
                props.onOptionUpdate(fips.code);
                setTextBoxValue("");
                popover.close();
              }}
            />
            <span className={styles.NoteText}>
              City and census tract location is currently unavailable
            </span>
          </div>
        )}
        {!isFips && (
          <Box my={3} mx={6}>
            <Grid container>
              {CATEGORIES_LIST.map((category) => {
                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={category.title}
                    className={styles.CategoryList}
                  >
                    <h3
                      className={styles.CategoryTitleText}
                      aria-label={category.title + " options"}
                    >
                      {category.title}
                    </h3>
                    <List dense={true} role="menu">
                      {(props.options as string[][]).map((item: string[]) => {
                        const [optionId, optionDisplayName] = item;
                        return (
                          // place variables in their respective categories
                          category.options.includes(
                            optionId as DropdownVarId
                          ) && (
                            <ListItem
                              role="menuitem"
                              key={optionId}
                              button
                              selected={optionId === props.value}
                              onClick={() => {
                                popover.close();
                                props.onOptionUpdate(optionId);
                              }}
                            >
                              <ListItemText primary={optionDisplayName} />
                            </ListItem>
                          )
                        );
                      })}
                    </List>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Popover>
    </>
  );
}

export default OptionsSelector;

//
//
//
//

// const Row = ({ index, style }: { index: number; style: any }) => {

//   if (!isFips) return null

//   const placeFips = props.options[index] as Fips;

//   return placeFips ? (
//     <div style={style}>{placeFips.getDisplayName()}</div>
//   ) : (
//     <></>
//   );
// };

function renderRow(props: ListChildComponentProps) {
  const { data, index, style } = props;
  const dataSet = data[index];
  const inlineStyle = {
    ...style,
    top: (style.top as number) + 10,
  };

  const place = dataSet?.props?.children?.[0];

  if (dataSet.hasOwnProperty("group")) {
    return (
      <ListSubheader key={dataSet.key} component="div" style={inlineStyle}>
        {dataSet.group}
      </ListSubheader>
    );
  }

  return (
    <Typography component="li" {...dataSet[0]} noWrap style={inlineStyle}>
      {place?.code && new Fips(place.code).getDisplayName()}
    </Typography>
  );
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef<HTMLDivElement>((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data: any) {
  const ref = React.useRef<VariableSizeList>(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

// Adapter for react-window
const ListboxComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;
  const itemData: React.ReactChild[] = [];
  (children as React.ReactChild[]).forEach(
    (item: React.ReactChild & { children?: React.ReactChild[] }) => {
      itemData.push(item);
      itemData.push(...(item.children || []));
    }
  );

  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up("sm"), {
    noSsr: true,
  });
  const itemCount = itemData.length;
  const itemSize = smUp ? 36 : 48;

  const getChildSize = (child: React.ReactChild) => {
    if (child.hasOwnProperty("group")) {
      return 48;
    }

    return itemSize;
  };

  const getHeight = () => {
    if (itemCount > 8) {
      return 8 * itemSize;
    }
    return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
  };

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={getHeight() + 2 * 10}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={(index) => getChildSize(itemData[index])}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});
