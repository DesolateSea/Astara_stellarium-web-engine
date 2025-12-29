import pandas as pd

data = pd.read_csv('dso_data.csv')

a = data['type'].value_counts()
print(a)