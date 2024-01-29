AHR_AGE_METRIC_IDS = {
    '18-44': {
        'asthma': '16372',
        'avoided_care': '16367',
        'cardiovascular_diseases': '16581',
        'depression': '16515',
        'diabetes': '406',
        'excessive_drinking': '776',
        'frequent_mental_distress': '2861',
    },
    '45-64': {
        'asthma': '16373',
        'avoided_care': '18357',
        'cardiovascular_diseases': '16582',
        'depression': '16516',
        'diabetes': '407',
        'excessive_drinking': '777',
        'frequent_mental_distress': '2862',
    },
    '65+': {
        'asthma': '16374',
        'avoided_care': '18358',
        'cardiovascular_diseases': '16583',
        'depression': '16517',
        'diabetes': '408',
        'excessive_drinking': '778',
        'frequent_mental_distress': '2863',
    },
}

AHR_RACE_METRIC_IDS = {
    'hispanic': {
        'asthma': '19989',
        'avoided_care': '20170',
        'cardiovascular_diseases': '20012',
        'depression': '20004',
        'diabetes': '19744',
        'excessive_drinking': '19807',
        'frequent_mental_distress': '19909',
    },
    'white:': {
        'asthma': '19987',
        'avoided_care': '20172',
        'cardiovascular_diseases': '20010',
        'depression': '20002',
        'diabetes': '19742',
        'excessive_drinking': '19808',
        'frequent_mental_distress': '19910',
    },
    'black': {
        'asthma': '19988',
        'avoided_care': '20171',
        'cardiovascular_diseases': '20011',
        'depression': '20003',
        'diabetes': '',
        'excessive_drinking': '',
        'frequent_mental_distress': '',
    },
    'asian': {
        'asthma': '16374',
        'avoided_care': '16369',
        'cardiovascular_diseases': '',
        'depression': '',
        'diabetes': '',
        'excessive_drinking': '',
        'frequent_mental_distress': '',
    },
    'multiracial': {
        'asthma': '16374',
        'avoided_care': '16369',
        'cardiovascular_diseases': '',
        'depression': '',
        'diabetes': '',
        'excessive_drinking': '',
        'frequent_mental_distress': '',
    },
    'some_other_race': {
        'asthma': '16374',
        'avoided_care': '16369',
        'cardiovascular_diseases': '',
        'depression': '',
        'diabetes': '',
        'excessive_drinking': '',
        'frequent_mental_distress': '',
    },
    'nhpi': {
        'asthma': '16374',
        'avoided_care': '16369',
        'cardiovascular_diseases': '',
        'depression': '',
        'diabetes': '',
        'excessive_drinking': '',
        'frequent_mental_distress': '',
    },
    'aian': {
        'asthma': '16374',
        'avoided_care': '16369',
        'cardiovascular_diseases': '',
        'depression': '',
        'diabetes': '',
        'excessive_drinking': '',
        'frequent_mental_distress': '',
    },
}

AHR_SEX_METRIC_IDS = {
    'male': {
        'asthma': '16370',
        'avoided_care': '16350',
        'cardiovascular_diseases': '16579',
        'depression': '16513',
        'diabetes': '404',
        'excessive_drinking': '789',
        'frequent_mental_distress': '2859',
    },
    'female': {
        'asthma': '16371',
        'avoided_care': '16349',
        'cardiovascular_diseases': '16580',
        'depression': '16514',
        'diabetes': '405',
        'excessive_drinking': '783',
        'frequent_mental_distress': '2860',
    },
}

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
AHR_SEX_VARS = {}
variable_placeholders = []

# Iterate over the descriptions and build the query
for name, description in AHR_DESCRIPTIONS.items():
    variable_name = f"where_{name}"
    variable_placeholders.append(f"${variable_name}: MeasureFilterInput_A")

    AHR_VARS[variable_name] = {"description": {"eq": description}}

    AHR_SEX_VARS[variable_name] = {
        "populationId": {"in": [1, 2]},
        "and": [
            {
                "description": {
                    "endsWith": "asthma",
                    "and": [{"ncontains": "served", "or": [{"ncontains": "ages"}]}],
                }
            }
        ],
    }

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
    AHR_QUERY += '      }\n'
    AHR_QUERY += '      state\n'
    AHR_QUERY += '      value\n'
    AHR_QUERY += '    }\n'
    AHR_QUERY += '  }\n'
AHR_QUERY += f'}}\n'
