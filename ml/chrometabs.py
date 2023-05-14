from nltk.stem import WordNetLemmatizer, SnowballStemmer
from youtube_transcript_api import YouTubeTranscriptApi
import requests
import json
import pickle
import gensim
import nltk
import time
import schedule
nltk.download('wordnet')


def send_data():
    
    loaded_model = pickle.load(open('/Users/aryavnagar/Downloads/model', 'rb'))
    
    response = requests.get("https://api.mittaldev.com/tablify-dev/fetchTabs?pass=dev-9Rza5wYq6eX9")
    print(response.json())
    
    stemmer = SnowballStemmer("english")
    
    def lemmatize_stemming(text_df):
        return stemmer.stem(WordNetLemmatizer().lemmatize(text_df, pos='v'))
    
    # Tokenize and lemmatize and (remove words less than 3 charectars (except for computer science maybe?)
    def preprocess(text_df):
        result=[]
        for token in gensim.utils.simple_preprocess(text_df) :
            if token not in gensim.parsing.preprocessing.STOPWORDS and len(token) > 3:
                result.append(lemmatize_stemming(token))
                
        return result
    
    
    def generate_transcript(id):
    	transcript = YouTubeTranscriptApi.get_transcript(id)
    	script = ""
    
    	for text in transcript:
    		t = text["text"]
    		if t != '[Music]':
    			script += t + " "
    		
    	return script, len(script.split())
    
            
    
    
    
    
    
    
    # for x in response:
    #    print(x['tabs']['content'][0])
        
    
    
    
    
    #print(response.json())
    
    # RESPONSE:
        
    # group=0 is Compsci, group=1 is History, 2=Biology,
    # The model adds the 'group' attribute to each Tab dictionary.
    # SAMPLE MODEL OUTPUT:
    
    # model_output = [{'id': '704990829',
    #   'tabs': [{'title': 'My Drive - Google Drive',
    #     'content': 'SuggestedStore, preview, and edit your Microsoft Office files directly in Drive. Learn moreStore image, audio, video, archive, code, Adobe, 3D, CAD files, and hundreds more. See all supported file typesSuggestedStore, preview, and edit your Microsoft Office files directly in Drive. Learn moreStore image, audio, video, archive, code, Adobe, 3D, CAD files, and hundreds more. See all supported file types',
    #     'id': 704990830, 'group': 0},
    #    {'title': 'My Drive - Google Drive',
    #     'content': 'SuggestedStore, preview, and edit your Microsoft Office files directly in Drive. Learn moreStore image, audio, video, archive, code, Adobe, 3D, CAD files, and hundreds more. See all supported file typesSuggestedStore, preview, and edit your Microsoft Office files directly in Drive. Learn moreStore image, audio, video, archive, code, Adobe, 3D, CAD files, and hundreds more. See all supported file types',
    #     'id': 704990945, 'group': 2},
    #    {'title': 'My Drive - Google Drive',
    #     'content': 'SuggestedStore, preview, and edit your Microsoft Office files directly in Drive. Learn moreStore image, audio, video, archive, code, Adobe, 3D, CAD files, and hundreds more. See all supported file typesSuggestedStore, preview, and edit your Microsoft Office files directly in Drive. Learn moreStore image, audio, video, archive, code, Adobe, 3D, CAD files, and hundreds more. See all supported file types',
    #     'id': 704990879, 'group': 1},
    #    {'title': 'My Drive - Google Drive',
    #     'content': 'SuggestedStore, preview, and edit your Microsoft Office files directly in Drive. Learn moreStore image, audio, video, archive, code, Adobe, 3D, CAD files, and hundreds more. See all supported file typesSuggestedStore, preview, and edit your Microsoft Office files directly in Drive. Learn moreStore image, audio, video, archive, code, Adobe, 3D, CAD files, and hundreds more. See all supported file types',
    #     'id': 704990885, 'group': 1},
    #    {'title': 'My Drive - Google Drive',
    #     'content': 'SuggestedStore, preview, and edit your Microsoft Office files directly in Drive. Learn moreStore image, audio, video, archive, code, Adobe, 3D, CAD files, and hundreds more. See all supported file typesSuggestedStore, preview, and edit your Microsoft Office files directly in Drive. Learn moreStore image, audio, video, archive, code, Adobe, 3D, CAD files, and hundreds more. See all supported file types',
    #     'id': 704990888, 'group': 0}]}]
    
    
    # STRUCTURE OF x:
    #x = {
    #     "windows" : [
    #         {
    #           "id": "first",
    #           "groups": [
    #               {
    #                   "id": 0,
    #                   "tabs": [Tabs]
    #                   }
    #               ]
    #           }
    #         ]
    #     
    
    x = {
         "windows": []
         }
    
    data = response.json()
    
    for window in data:
        if 'tabs' in window:
            for tab in window['tabs']:
                test_str = 'watch?v='
                if test_str in tab['url']:
                    yt_id = tab['url'].split("=",1)[1]
                    transcript, length = generate_transcript(yt_id)
                    test = preprocess(transcript)
                else:
                    test = preprocess(tab['content'])
            
            
                testFinal = " ".join(test)
                # print(testFinal)            
                
                pred_conf = max(((loaded_model.predict_proba([testFinal]))[0]))
                pred = (loaded_model.predict([testFinal]))[0]
                print(((loaded_model.predict_proba([testFinal]))[0]))
                print(pred_conf)
                
                if pred_conf > 0.51:
                    tab['group'] = int(pred)
                else:
                    tab['group'] = 3


    
    for window in data:    
        groups = [
            {
                "id": 0,
    #           "name": "History",
                "tabs": []
                },
            {
                "id": 1,
    #            "name": "Biology",
                "tabs": []
                },
            {
                "id": 2,
    #            "name": "Comp Sci",
                "tabs": []
                },
            {
                "id": 3,
    #            "name": "Cant sort",
                "tabs": []
                }]
        
        if 'tabs' in window:
            for tab in window['tabs']:
                groups[tab['group']]['tabs'].append(tab)
            
        x['windows'].append({
            "id": window['id'],
            "groups": groups
            })
        
        
        
    #print(x)
    
    finalData =x
    finalData['pass'] = 'dev-9Rza5wYq6eX9'
    
    finalData = json.dumps(finalData)
    
    url = 'https://api.mittaldev.com/tablify-dev/updateGroups'
    
    print(finalData)
    
    headers = {'Content-type': 'application/json'}
    post = requests.post(url, finalData, headers=headers)
    print(post.json())

schedule.every(15).seconds.do(send_data)


while 1:
    schedule.run_pending()
    time.sleep(1)
    
    