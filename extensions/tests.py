
import os
import selenium
from selenium import webdriver

with open('sites.txt') as f:
    sites = [line.rstrip() for line in f]

BROWSER = os.getenv("BROWSER", "CHROME")
print("TESTING BROWSER: ", BROWSER)

NUM_RUNS = 10
LOAD_TIMES = []

for site in sites:
    LOAD_TIMES.append({"site": site, "with_extension": [], "default": []})

for _ in range(NUM_RUNS):
    for j, site in enumerate(sites):
        print("site: ", site)

        if BROWSER == "CHROME":
            options = webdriver.ChromeOptions()
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-gpu')
        else:
            options = webdriver.FirefoxOptions()
        options.add_argument('--headless')

        # get load time without extension
        if BROWSER == "CHROME":
            driver = webdriver.Chrome(options=options)
            driver.delete_all_cookies()
        else:
            driver = webdriver.Firefox(options=options)

        try:
            driver.get("https://{}".format(site))
            response_start = driver.execute_script("return window.performance.timing.responseStart")
            dom_complete = driver.execute_script("return window.performance.timing.domComplete")
        except selenium.common.exceptions.WebDriverException as e:
            print(e)

        driver.quit()

        # get load time with extension
        if BROWSER == "CHROME":
            options.add_argument('--load-extension=/usr/src/chrome/')
            driver_extension = webdriver.Chrome(options=options)
            driver_extension.delete_all_cookies()
        else:
            profile = webdriver.FirefoxProfile()
            profile.add_extension(extension='/usr/src/firefox/')
            driver_extension = webdriver.Firefox(options=options, firefox_profile=profile)
        
        try:
            driver_extension.get("https://{}".format(site))
            response_start_extension = driver_extension.execute_script("return window.performance.timing.responseStart")
            dom_complete_extension = driver_extension.execute_script("return window.performance.timing.domComplete")
        except selenium.common.exceptions.WebDriverException as e:
            print(e)

        driver_extension.quit()

        LOAD_TIMES[j]["with_extension"].append(dom_complete_extension - response_start_extension)
        LOAD_TIMES[j]["default"].append(dom_complete - response_start)

print(LOAD_TIMES)
