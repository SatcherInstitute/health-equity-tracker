import { insertOptionalThe } from "./MadLibs";

const _the = " the"
const _no_the = ""

const usaOneVarSelections = { 1: 'covid', 3: '00' }
const usaOneDoesNotGetThe = 0
const usaOneGetsThe = 2

const usaTwoGeoSelections = { 1: 'covid', 3: '00', 5: '13' }
const usaTwoGeoDoesNotGetThe = 0
const usaTwoGeoGetsThe = 2
const usaTwoGeoAlsoDoesNotGetThe = 0



describe("MadLib Unit Tests", () => {
  test("Test insertOptionalThe()", async () => {

    expect(insertOptionalThe(usaOneVarSelections, usaOneDoesNotGetThe)).toEqual(_no_the
    );

    expect(insertOptionalThe(usaOneVarSelections, usaOneGetsThe)).toEqual(_the
    );


    expect(insertOptionalThe(usaTwoGeoSelections, usaTwoGeoDoesNotGetThe)).toEqual(_no_the
    );

    expect(insertOptionalThe(usaTwoGeoSelections, usaTwoGeoGetsThe)).toEqual(_the
    );

    expect(insertOptionalThe(usaTwoGeoSelections, usaTwoGeoAlsoDoesNotGetThe)).toEqual(_no_the
    );




  });

})

export { }