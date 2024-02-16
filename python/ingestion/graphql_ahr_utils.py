AHR_QUERY = """
query Data_A($where: MeasureFilterInput_A) {
  measures_A(where: $where) {
    name
    data {
      dateLabel
      state
      value
      measure { name }
    }
  }
}
"""


TEST_VARS = """
{
  "where": {
    "and": [
      {"or": [
        {"description": {"contains": "who reported ever being told by a health professional that they currently have asthma"}},
        {"description": {"contains": "needed to see a doctor but could not because of cost"}},
        {"description": {"contains": "needed to visit a doctor but could not because of cost"}}
      ]},
      {"description": {"ncontains": "served"}},
      {"description": {"ncontains": "65"}},
      {"description": {"ncontains": "Women"}}
    ],
    "population": {
      "name": {
        "in": [
          null, "Male", "Female", "Ages 18-44", "Ages 45-64", "Ages 65+", "Hispanic",
          "White", "Black", "Asian", "Hawaiian/Pacific Islander",
          "American Indian/Alaska Native", "Other Race", "Multiracial"
        ]
      }
    }
  }
}
"""
