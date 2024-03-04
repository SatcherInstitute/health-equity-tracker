# AHR_QUERY = """
# query Data_A($where: MeasureFilterInput_A, $order: [MeasureSortInput_A!]) {
#   measures_A(where: $where, order: $order) {
#     data {
#       dateLabel
#       state
#       value
#       measure {
#         name
#         unitType
#         description
#       }
#     }
#   }
# }
# """

AHR_QUERY = """
query Data_A($where: MeasureFilterInput_A, $dataWhere2: MeasureDatumFilterInput_A, $subpopulationsWhere2: MeasureFilterInput_A) {
  measures_A(where: $where) {
    data(where: $dataWhere2) {
      dateLabel
      state
      value
      measure {
        name
        subpopulations(where: $subpopulationsWhere2) {
          name
          unitType
          description
        }
      }
      
    }
  }
}
"""

AHR_VARS = """
{
  "where": {
      "description": {"contains": "Percentage of adults who reported ever being told by a health professional that they currently have asthma"}
  },
  "subpopulationsWhere2": {
    "description": {
      "contains": "males"
    }
  }
}
"""
