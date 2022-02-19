import { h, FC, renderSSR, Component } from 'nano-jsx'
import { createServer } from 'http'

const List: FC<{ data: string[] }> = ({ data }) => {
  return (
    <ul>
      {data.map(d => (
        <li>{d}</li>
      ))}
    </ul>
  )
}

class App extends Component {
  render() {
    return (
      <div>
        <h1>Nano JSX</h1>
        LIST_PLACEHOLDER
      </div>
    )
  }
}

// mock a data fetch with 1 second delay
const fetchData = async (): Promise<string[]> => {
  const data = ['one', 'two']

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data)
    }, 1000)
  })
}

const server = createServer(async (_req, res) => {
  // send headers
  res.setHeader('Content-Type', 'text/html')

  // send first part to browser
  res.write('<!DOCTYPE html><html lang="en"><body>')

  // render the <App/> and split it where the <List/> component should be
  const chunks = renderSSR(<App />).split('LIST_PLACEHOLDER')

  // send first chunk of <App/> component
  res.write(chunks[0])

  // fetch the data for the <List/> component
  const data = await fetchData()

  // render and send the <List/> component
  res.write(renderSSR(<List data={data} />))

  // send second chunk of <App/> component
  res.write(chunks[1])

  // send rest of the html page
  res.write('</body></html>')

  // end the request
  return res.end()
}).listen(8080, () => console.log('open http://localhost:8080'))

// graceful server shutdown
process.on('SIGTERM', () => {
  server.close()
})
