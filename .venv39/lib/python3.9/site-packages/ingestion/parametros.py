

class Parametros():

    def __init__(self,
                type_insert_table, 
                list_columns_to_use=None, 
                list_columns_format_date=None, 
                list_analytics=None,
                list_columns_delete=None, 
                list_lines_delete=None,
                list_columns_rename=None, 
                list_field_reorganize=None,
                list_lines_duplicates=None,
                list_parametros_enrichment_sql=None
            ):

        self.type_insert_table = type_insert_table
        self.list_columns_to_use = list_columns_to_use
        self.list_columns_format_date = list_columns_format_date
        self.list_analytics = list_analytics
        self.list_columns_delete = list_columns_delete
        self.list_lines_delete = list_lines_delete
        self.list_columns_rename = list_columns_rename
        self.list_field_reorganize = list_field_reorganize
        self.list_lines_duplicates = list_lines_duplicates
        self.list_parametros_enrichment_sql = list_parametros_enrichment_sql
        

class ParametrosEnrichmentSQL():

    def __init__(self, 
                how, 
                left_on, 
                right_on,
                left_query=None, 
                right_query=None, 
            ):

        self.left_query = left_query
        self.right_query = right_query
        self.how = how
        self.left_on = left_on
        self.right_on = right_on
