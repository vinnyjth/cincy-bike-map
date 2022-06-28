import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Map from './map'

export default function Home() {
  return (
    <>
      <Head>
        <title>Low Stress Bike Map</title>
        <meta name="description" content="Low Stress Bike Map" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Map />
      </>
  )
}
