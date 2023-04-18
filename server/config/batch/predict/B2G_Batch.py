####################################
#      작성자 : Gwongyu Yoon       #
####################################
 
from django.db import transaction
from datetime import datetime
from django.http import JsonResponse
import numpy as np
from io import StringIO
import requests
from pickle import FALSE
import pymysql
import sys 
import tensorflow as tf
import pandas as pd
import traceback
# import joblib
# from sklearn.externals.joblib import load
import joblib
sys.modules['sklearn.externals.joblib'] = joblib


# conn = pymysql.connect(host='localhost', db ='sci_b2g_v2', user='edlmanager', password='Sci2019qa!')
conn = pymysql.connect(host='localhost', db ='sci_b2g_v2', user='root', password='sci2020qa!')      

# 유저 목록 불러오기
def select_user_list():
    cursor = conn.cursor()    
    query = '''
            SELECT user_code
            FROM user_info
            WHERE user_status = "Y"
            ORDER BY user_code ASC;
            '''.format()
    cursor.execute(query)
    return cursor.fetchall()

def user_batch_check(userCode):
    try:
        params = {
            'userCode': userCode
            }
        url = "http://192.168.3.164:7070/api/batch/B2G_Batch"
        response = requests.post(url=url, data=params)
        result= response.json()
        return result

    except Exception as e:
        print(e)

def data_backup(userCode):
    try:
        params = {
            'userCode': userCode
            }
        url = "http://192.168.3.164:7070/api/batch/data_backup"
        response = requests.post(url=url, data=params)
        result= response.json()
        return result

    except Exception as e:
        print(e)

def batch_result_insert(userCode, sleep_hr, sleep_stress, sleep_index, glucos, pressure_high, pressure_low, health_index):
    try :
        params = {
            'userCode': userCode,
            'sleep_hr': sleep_hr,
            'sleep_stress': sleep_stress,
            'sleep_index': sleep_index,
            'glucos': glucos,
            'pressure_high': pressure_high,
            'pressure_low': pressure_low,
            'health_index': health_index
            }
        url = "http://192.168.3.164:7070/api/batch/batch_insert"
        response = requests.post(url=url, data=params)
        result= response.text
        return result
    except Exception as e:
        print(e)

def Batch_Cron():
    try:
        userList = np.array(list(select_user_list()))
        
        pred=predictDisease()

        for i in range(len(userList)) :
            batch_check = user_batch_check(userList[i])
            check_Batch = batch_check['check_Batch']
            
            if check_Batch == 'Y' :
                sleep_hr = batch_check['sleep_hr']
                sleep_index = batch_check['sleep_index']
                sleep_stress = batch_check['sleep_stress']
                health_index = batch_check['health_index']

                model_hr = batch_check['model_hr']
                model_rr = batch_check['model_rr']
                model_hrv = batch_check['model_hrv']
                model_sdnn = batch_check['model_sdnn']
                model_rmssd = batch_check['model_rmssd']
                model_pnn50 = batch_check['model_pnn50']
                model_age = batch_check['model_age']
                model_gen = batch_check['model_gen']

                pred.set_inputdata(model_hr, model_rr, model_hrv, model_sdnn, model_rmssd, model_pnn50, model_age, model_gen)

                glucos = pred.predictGlucos()
                pressure_high = pred.predictPressureHigh()
                pressure_low = pred.predictPressureLow()

                if glucos < 100 :
                    health_index += 45
                elif glucos < 105 :
                    health_index += 39
                elif glucos < 110 :
                    health_index += 33
                elif glucos < 115 :
                    health_index += 27
                elif glucos < 120 :
                    health_index += 21
                else :
                    health_index += 15


                if pressure_high < 120 :
                    health_index += 45
                elif pressure_high < 125 :
                    health_index += 39
                elif pressure_high < 130 :
                    health_index += 33
                elif pressure_high < 135 :
                    health_index += 27
                elif pressure_high < 140 :
                    health_index += 21
                else :
                    health_index += 15

                batch_result_insert(userList[i], sleep_hr, sleep_stress, sleep_index, glucos, pressure_high, pressure_low, health_index)
                print(userList[i], health_index, glucos, pressure_high, pressure_low)

            else :
                print(userList[i], "No")

        for i in range(len(userList)) :
            data_backup(userList[i])

    except Exception as e:
        print(str(e))

class predictDisease:
    def __init__(self):
        # 배포 전 경로수정
        #############################################################################################################################################################
        # 혈당 예측 모델
        self.diabetespredmodel = tf.keras.models.load_model('C:\\Users\\SCI\\Desktop\\b2gv2\\server\\config\\batch\\predict\\B2G_Model\\glucose\\blood_sugar_20230308_300_gen_del_6.h5')  
        self.diabetespredsc=joblib.load('C:\\Users\\SCI\\Desktop\\b2gv2\\server\\config\\batch\\predict\\B2G_Model\\glucose\\blood_sugar_20230315_350_gen_del.bin')  

        # 최고 혈압 예측 모델
        self.highbppredict=tf.keras.models.load_model('C:\\Users\\SCI\\Desktop\\b2gv2\\server\\config\\batch\\predict\\B2G_Model\\bp_high\\BP_HIGH_230314_gen_del_1.h5')  
        self.highbppredictsc=joblib.load('C:\\Users\\SCI\\Desktop\\b2gv2\\server\\config\\batch\\predict\\B2G_Model\\bp_high\\BP_HIGH_230314_gen_del_2.bin')  

        # 최저 혈압 예측 모델
        self.lowbppredict=tf.keras.models.load_model('C:\\Users\\SCI\\Desktop\\b2gv2\\server\\config\\batch\\predict\\B2G_Model\\bp_low\\blood_pressure_20230315_350_gen_del_3.h5')  
        self.lowbppredictsc=joblib.load('C:\\Users\\SCI\\Desktop\\b2gv2\\server\\config\\batch\\predict\\B2G_Model\\bp_low\\blood_pressure_20230315_350_gen_del_2.bin')  

        # # 혈당 예측 모델
        # self.diabetespredmodel = tf.keras.models.load_model('/home/server/B2G_server/config/batch/predict/B2G_Model/glucose/blood_sugar_20230308_300_gen_del_6.h5')  
        # self.diabetespredsc=load('/home/server/B2G_server/config/batch/predict/B2G_Model/glucose/blood_sugar_20230315_350_gen_del.bin')  

        # # 최고 혈압 예측 모델
        # self.highbppredict=tf.keras.models.load_model('/home/server/B2G_server/config/batch/predict/B2G_Model/bp_high/BP_HIGH_230314_gen_del_1.h5')  
        # self.highbppredictsc=load('/home/server/B2G_server/config/batch/predict/B2G_Model/bp_high/BP_HIGH_230314_gen_del_2.bin')  

        # # 최저 혈압 예측 모델
        # self.lowbppredict=tf.keras.models.load_model('/home/server/B2G_server/config/batch/predict/B2G_Model/bp_low/blood_pressure_20230315_350_gen_del_3.h5')  
        # self.lowbppredictsc=load('/home/server/B2G_server/config/batch/predict/B2G_Model/bp_low/blood_pressure_20230315_350_gen_del_2.bin')
        #############################################################################################################################################################
    def set_inputdata(self,hr, rr, hrv,sdnn,rmssd,pnn50,gender, age):
        try:
            self.input_data_predict = pd.DataFrame({'HR': hr, 'RR': rr,'HRV': hrv,
                                        'SDNN': sdnn,'RMSSD': rmssd, 'PNN50': pnn50,'AGE' : age})
        except Exception as e:
            print(str(e))

    def predictGlucos(self):
        pred_avg=0
        try:
            X=self.input_data_predict.values
            X_sc=self.diabetespredsc.transform(X)
            pred=self.diabetespredmodel.predict(X_sc)
            pred_avg=int(sum(pred)/len(pred))
        except Exception as e:
            print("Glucos",str(e))
        return pred_avg

    def predictPressureHigh(self):
        pred_avg=0
        try:
            X=self.input_data_predict.values
            X_sc=self.highbppredictsc.transform(X)
            pred=self.highbppredict.predict(X_sc)
            pred_avg=int(sum(pred)/len(pred))
        except Exception as e:
            print("Pressure High",str(e))
        return pred_avg    

    def predictPressureLow(self):
        pred_avg=0
        try:
            X=self.input_data_predict.values
            X_sc=self.lowbppredictsc.transform(X)
            pred=self.lowbppredict.predict(X_sc)
            pred_avg=int(sum(pred)/len(pred))
        except Exception as e:
            print("Pressure Low",str(e))
        return pred_avg

Batch_Cron()





