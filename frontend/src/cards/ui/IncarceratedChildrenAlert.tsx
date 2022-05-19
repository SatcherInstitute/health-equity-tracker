import React from "react";
import { Alert } from "@material-ui/lab";
import { LinkWithStickyParams } from "../../utils/urlutils";
import { Fips } from "../../data/utils/Fips";

interface IncarceratedChildrenAlertProps {
  prisonCountUnder18: number;
  fips: Fips;
  // dataName: string;
  // breakdownString: BreakdownVarDisplayName;
  // noDemographicInfo?: boolean;
  // isMapCard?: boolean;
  // fips: Fips;
  // dropdownVarId?: DropdownVarId;
  // ageAdjustedDataTypes?: VariableConfig[];
}

function IncarceratedChildrenAlert(props: IncarceratedChildrenAlertProps) {
  return (
    <Alert severity="error" role="note">
      There are currently{" "}
      <b>
        {props.prisonCountUnder18} children under the age of 18 incarcerated in
        adult prison facilities in {props.fips.getDisplayName()}
      </b>
      . This total is distinct from the larger number who are incarcerated
      elsewhere including local jails or juvenile detention centers. There is no
      absolute minimum age in most states nor federally for a child to be
      incarcerated within an adult prison facility, and in some cases{" "}
      <b>children as young as 8 years old</b> have been so imprisoned. Learn
      more about how this lack of minimum-age sentencing requirements{" "}
      <LinkWithStickyParams to={"https://eji.org/issues/children-in-prison/"}>
        affects health equity, particularly for Black and Latino youths.
      </LinkWithStickyParams>
    </Alert>
  );
}

export default IncarceratedChildrenAlert;
