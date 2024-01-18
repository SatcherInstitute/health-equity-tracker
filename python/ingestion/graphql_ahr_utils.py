AHR_DESCRIPTIONS = {
    'asthma': "Percentage of adults who reported ever being told by a health professional that they currently have asthma",
    'avoided_care': "Percentage of adults who reported a time in the past 12 months when they needed to see a doctor but could not because of cost",
    'cardiovascular_diseases': "Percentage of adults who reported ever being told by a health professional that they had angina or coronary heart disease, a heart attack or myocardial infarction, or a stroke",
    'depression': "Percentage of adults who reported ever being told by a health professional that they have a depressive disorder, including depression, major depression, minor depression or dysthymia",
    'diabetes': "Percentage of adults who reported being told by a health professional that they have diabetes (excluding prediabetes and gestational diabetes) (pre-2011 BRFSS methodology)",
    'excessive_drinking': "Percentage of adults who reported binge drinking (four or more [females] or five or more [males] drinks on one occasion in the past 30 days) or heavy drinking (eight or more [females] or 15 or more [males] drinks per week)",
    'frequent_mental_distress': "Percentage of adults who reported their mental health was not good 14 or more days in the past 30 days",
}

# Initialize the AHR_QUERY string
AHR_QUERY = '''
query MeasuresByAll(
'''

AHR_VARS = {}
variable_placeholders = []

# Iterate over the descriptions and build the query
for name, description in AHR_DESCRIPTIONS.items():
    variable_name = f"where_{name}"
    variable_placeholders.append(f"${variable_name}: MeasureFilterInput_A")
    AHR_VARS[variable_name] = {"description": {"eq": description}}


# Add the closing parentheses and variable placeholders
AHR_QUERY += f'{", ".join(variable_placeholders)}\n'
AHR_QUERY += f') {{\n'

# Iterate over the descriptions again and add query fields
for name, description in AHR_DESCRIPTIONS.items():
    variable_name = f"$where_{name}"

    AHR_QUERY += f'  {name}: measures_A(where: {variable_name}) {{\n'
    AHR_QUERY += '    data {\n'
    AHR_QUERY += '      dateLabel\n'
    AHR_QUERY += '      measure {\n'
    AHR_QUERY += '        name\n'
    AHR_QUERY += '        unitType\n'
    AHR_QUERY += '        source {\n'
    AHR_QUERY += '          name\n'
    AHR_QUERY += '        }\n'
    AHR_QUERY += '      }\n'
    AHR_QUERY += '      state\n'
    AHR_QUERY += '      value\n'
    AHR_QUERY += '    }\n'
    AHR_QUERY += '  }\n'
AHR_QUERY += f'}}\n'
