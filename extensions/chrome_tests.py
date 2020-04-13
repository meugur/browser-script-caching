
from selenium import webdriver

with open('sites.txt') as f:
    sites = [line.rstrip() for line in f]

for site in sites:
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-gpu')

    # get load time without extension
    driver = webdriver.Chrome(options=options)
    driver.delete_all_cookies()
    driver.get("https://{}".format(site))
    response_start = driver.execute_script("return window.performance.timing.responseStart")
    dom_complete = driver.execute_script("return window.performance.timing.domComplete")
    driver.quit()

    # get load time with extension
    options.add_argument('--load-extension=/usr/src/extensions/main/')
    driver_extension = webdriver.Chrome(options=options)
    driver_extension.delete_all_cookies()
    driver_extension.get("https://{}".format(site))
    response_start_extension = driver_extension.execute_script("return window.performance.timing.responseStart")
    dom_complete_extension = driver_extension.execute_script("return window.performance.timing.domComplete")

    print('site: {}'.format(site))
    print('w/o: {} -- w/: {}'.format(
            dom_complete - response_start,
            dom_complete_extension - response_start_extension
        )
    )    
