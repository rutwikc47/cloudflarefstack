addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {

  const URL = `https://cfw-takehome.developers.workers.dev/api/variants`;
  const fetchResult = fetch(URL)
  const response = await fetchResult;
  const jsonData = await response.json();
  const urls = jsonData.variants
  let [url1, url2] = urls

  // Get the cookie from the request headers
  const cookval = request.headers.get('cookie')
  console.log(cookval);

  // Check whether there is an imbalance between the requests called
  if (cookval && cookval.includes(`imbalance1`)) {

    return await responseCheck(cookval.split(" ")[2], cookval.split(" ")[1])

  } else if (cookval && cookval.includes(`imbalance2`)) {

    return await responseCheck(cookval.split(" ")[2], cookval.split(" ")[1])

  } else {

  // If there is no imbalance then randomly call url1 or url2
    var randomurl = function() {
      return (Math.random() < 0.5 ? url1 : url2);
    }
    const ranurl = randomurl();
    return await responseCheck(ranurl, urls[Math.abs((urls.indexOf(ranurl))-1)])
  }
}

async function responseCheck(furl, orl) {

  // Check the last character of the url for further processing
  var charC = furl.charAt(furl.length-1);
  let response = await fetch(furl);
  const responseClone = new Response(response.body, response);

  // Using the charC decide what type of imbalance will be caused next and store information in cookies to persist versions as asked in the extra credit tasks
  if (charC === '1'){
    responseClone.headers.set('Set-Cookie', `cloud=imbalance2 ${furl} ${orl}; Expires=Wed, 21 Oct 2020 07:28:00 GMT; path=/`)
  } else {
    responseClone.headers.set('Set-Cookie', `cloud=imbalance1 ${furl} ${orl}; Expires=Wed, 21 Oct 2020 07:28:00 GMT; path=/`)
  }

  return new HTMLRewriter().on('*', new ElementHandler(furl)).transform(responseClone)
}

class ElementHandler {

  // Change all the values as asked in the extra-credit tasks
  constructor(url){

    self.url = url

  }
  element(element) {

    if (element.tagName == 'title') {
      if (self.url.charAt(self.url.length-1) === '1') {
        element.setInnerContent("Cloudflare worker")
      }else{
        element.setInnerContent("Cloudflare dev")
      }
    }
    if (element.tagName == 'h1') {
      if (self.url.charAt(self.url.length-1) === '1') {
        element.setInnerContent("Cloudflare worker")
      }else{
        element.setInnerContent("Cloudflare dev")
      }
    }

    if (element.tagName == 'p') {
      if (self.url.charAt(self.url.length-1) === '1') {
        element.setInnerContent("The Network is the computer")
      }else{
        element.setInnerContent("The computer is not the network")
      }
    }

    if (element.tagName == 'a') {
        element.setInnerContent("Try the new url")
        element.setAttribute("href", "https://www.youtube.com/watch?time_continue=5&v=9Av27ejxsvY")
    }
  }

}
