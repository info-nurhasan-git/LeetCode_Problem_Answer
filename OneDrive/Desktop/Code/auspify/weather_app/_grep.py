import sys

sys.stdout.reconfigure(encoding="utf-8")

path = "C:\\Users\\nurha\\OneDrive\\Desktop\\Code\\auspify\\weather_app\\index.js"
with open(path, encoding="utf-8") as handle:
    text = handle.read()
print("render count:", text.count("render")
      )
print("refresh count:", text.count("refresh")
      )
print("byDay count:", text.count("byDay"
      ))
index = text.find("function buildDailyDays")
print("buildDailyDays found at:", index
      )
print("around 4000:", repr(text[text.find("async") - 200:text.find("async") + 200])
      )
