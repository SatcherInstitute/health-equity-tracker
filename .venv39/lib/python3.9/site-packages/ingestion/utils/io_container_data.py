
from datetime import datetime
import os
import pandas as pd
from io import StringIO
from azure.storage.blob import BlobServiceClient, __version__
import logging

class IOContainerData():

    def __init__(self):

        logging.info("Azure Blob Storage v" + __version__ + " - Python quickstart sample")

        self.account_name="proiotbdsa"
        self.account_key="9cVILtcehE1ZHuLMt9VyePgpXFqNwKP00h03g/JNzaxUcaEZMPTUkwirfYtH2joLRyA6ZW8zxmKcbxe5m0Gxfg=="

        self.connect_str ="DefaultEndpointsProtocol=https;AccountName="+self.account_name+";AccountKey="+self.account_key+";EndpointSuffix=core.windows.net"
        self.blob_service_client = BlobServiceClient.from_connection_string(self.connect_str)
        
        self.dir_backup = 'archived/'
        self.dir_failed = 'failed/'
        self.dir_input_enrichment='input/'

        self.name_container_bronze = "bronze"
        self.name_container_silver = "silver"
        self.name_container_gold = "gold"



    def get_extension(self,file_path):
    
        _, extension = os.path.splitext(file_path)
        self.extension = extension

        return self.extension



    def list_file(self, name_container):
          
        container_client = self.blob_service_client.get_container_client(name_container)
        blob_list = container_client.list_blobs()

        name = []
        for blob in blob_list:
            name.append( blob.name )

        self.blob_names = name

        return self.blob_names



    def get_file(self, name_container, file_path ):
          
        container_client = self.blob_service_client.get_container_client(name_container)
        blob_client_instance = container_client.get_blob_client(file_path)

        return blob_client_instance.download_blob()


    def download_blob(self, name_container, file_path):

        stream_blob = self.get_file( name_container, file_path )

        self.get_extension(file_path)

        if ( self.extension == ".xlsx" or self.extension == ".xls"):
            content = stream_blob.content_as_bytes()
            return len(content), content
        else:
            content = stream_blob.content_as_text()
            return len(content), StringIO( content )



    def get_content_length(self, name_container, file_path) -> int:

        container_client = self.blob_service_client.get_container_client(name_container)
        blob_client_instance = container_client.get_blob_client(file_path)

        a = blob_client_instance.get_blob_properties()
        self.content_length = a.size

        return self.content_length


    def upload_frame_to_blob(self, container, file_name_blob, df_data):

        container_client = self.blob_service_client.get_blob_client(container, blob=file_name_blob)

        container_client.upload_blob(data=df_data.to_csv(index=False), overwrite=True)



    def __cp_file_in_container(self, source_file_path, dest_file_path, name_container ):

        container_client = self.blob_service_client.get_container_client(name_container)

        # Source    
        source_blob = container_client.get_blob_client(source_file_path)

        # Target
        dest_blob = container_client.get_blob_client(dest_file_path)
        dest_blob.start_copy_from_url(source_blob.url)
       
        return dest_blob


    def __cp_file(self, source_file_path, dest_file_path, source_container_name, dest_container_name):
        
        # Source
        source_blob = (f"https://{self.account_name}.blob.core.windows.net/{source_container_name}/{source_file_path}")

        # Target
        copied_blob = self.blob_service_client.get_blob_client(dest_container_name, dest_file_path)
        copied_blob.start_copy_from_url(source_blob)

        return copied_blob

    def cp_file(self,  source_file_path, dest_file_path, source_container_name, dest_container_name=None):

        if(dest_container_name == None):
            
            logging.info(f"Copy {source_container_name}/{source_file_path} to {dest_container_name}/{dest_file_path}")
            dest_blob = self.__cp_file_in_container(source_file_path, dest_file_path, source_container_name)
        
        else:

            logging.info(f"Copy {source_container_name}/{source_file_path} to {source_container_name}/{dest_file_path}")
            dest_blob = self.__cp_file(source_file_path, dest_file_path, source_container_name, dest_container_name)

        copy_properties = dest_blob.get_blob_properties().copy

        if copy_properties.status != "success":
            dest_blob.abort_copy(copy_properties.id)
            raise Exception(f"Unable to copy blob %s with status %s"% (source_file_path, copy_properties.status))
        else:
            logging.info(f"Copy {source_file_path} to {dest_file_path} end")



    def mv_file(self, source_file_path, dest_file_path, source_container_name, dest_container_name=None ):
   
        # Copy file
        self.cp_file(source_file_path, dest_file_path, source_container_name, dest_container_name )

        # Get file and delete 
        remove_blob = self.blob_service_client.get_blob_client(source_container_name, source_file_path)
        remove_blob.delete_blob()


    def load(self, path_file, name_container,  sep=',', header=0, dtype=None, chunksize=None) -> pd.DataFrame:

        self.get_extension(path_file)

        if (self.extension == ".xlsx" ):
            
            self.pd =  pd.read_excel(
                    f"abfs://{name_container}/{path_file}",
                    storage_options={
                        "connection_string": self.connect_str
                    },
                    header=header, 
                    dtype=dtype,      
                    engine='openpyxl'
                )

        elif( self.extension == ".xls" ):
            
            self.pd =  pd.read_excel( 
                    f"abfs://{name_container}/{path_file}",
                    storage_options={
                        "connection_string": self.connect_str
                    },
                    header=header, 
                    dtype=dtype
                )

        else:
            
            self.pd =  pd.read_csv( 
                    f"abfs://{name_container}/{path_file}",
                    storage_options={
                        "connection_string": self.connect_str
                    },
                    header=header, 
                    sep=sep, 
                    dtype=dtype, 
                    chunksize=chunksize
                )
        
        return self.pd



if __name__ == '__main__':

    transferContainer = IOContainerData()

    transferContainer.get_content_length(transferContainer.name_container_silver, 
    "datalake/database/db_cateira/sfa_cateira_completa_diaria/input/cliente_tudo.csv");

    #f = transferContainer.get_file(transferContainer.name_container_silver, 
    #"datalake/database/db_cateira/sfa_cateira_completa_diaria/input/cliente_tudo.csv");
    #print(f)

    d = { 'nome': ['nome_1', 'nome_2'], 'email': ['email_1', 'email_2']}
    df = pd.DataFrame(data=d)
    #output = df.to_csv (index_label="idx", encoding = "utf-8")
    #print(output)

    #transferContainer.upload_frame_to_blob("bronze", "test1.csv", df )

    #f1 = transferContainer.download_blob("bronze", "frame/Framework.xlsx")
    #e1 = transferContainer.get_extension()
    #f2 = transferContainer.download_blob("bronze", "teste/teste.csv")
    #e2 = transferContainer.get_extension()

    #ld1 = LoadData(f1, e1)
    #d1 = ld1.load()

    #print(d1)

    #ld2 = LoadData(f2, e2)
    #d2 = ld2.load()

    #print(d2)

    #gs = transferContainer.list_file("bronze")

    #for g in gs:
    #    print(g)
    #    conteudo = transferContainer.download_blob("bronze", g)
        
    #    loadData = LoadData(conteudo, ".csv")
    #    _df = loadData.load()

    #    print(list(_df.columns))

        #transferContainer.backup_file( g )
        #transferContainer.cp_file( g, "BDMs.xlsx" , "bronze" )
        #transferContainer.cp_file_in_container("bronze" , g, "BDMs.xlsx" )

    #transferContainer.get_file("bronze")

    #for g in  gs:
    #    loadData = LoadData(g)

    #    pd_fk = loadData.load()
    #    print(list(pd_fk.columns))
