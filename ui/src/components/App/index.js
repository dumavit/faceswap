import React from 'react';
import axios from 'axios';
import urljoin from 'url-join';
import Modal from 'react-modal';

import ImageSelector from '../ImageSelector';
import * as urls from 'urls';
import plusSign from 'icons/plus-icon.png';
import equalSign from 'icons/equal-icon.png';
import smilingFace from 'icons/smiling-face.jpg';

import './App.scss';

const modelStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    width: '80%',
    height: '80%',
    transform: 'translate(-50%, -50%)'
  }
};

const imageMapping = {
  trump: 'imageA',
  cage: 'imageB',
};


// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#root');


class App extends React.Component {
  state = {
    // Both images and their results
    imageA: null,
    imageB: null,
    resultA: null,
    resultB: null,

    // Modal state
    isModalOpen: false,
    modalPerson: '',
  }

  componentDidUpdate(prevProps, prevState) {
    const { imageA, imageB } = this.state;
    if (imageA && imageB) {
      if (imageA !== prevState.imageA || imageB !== prevState.imageB) {
        axios
          .get(urls.IMAGE_SWAP_API_URL, { params: { imageA, imageB } })
          .then(response => this.setState({
            resultA: response.data.resultA,
            resultB: response.data.resultB
          }))
      }
    }
  }


  openModal = modalPerson => this.setState(({
    isModalOpen: true,
    modalPerson,
  }))


  closeModal = () => this.setState({
    isModalOpen: false,
    modalPerson: ''
  })

  onSelectImage = imageName => this.setState(
    prevState => ({
      // Set imageName
      [imageMapping[prevState.modalPerson]]: imageName,
      // Close modal
      isModalOpen: false,
      modelPerson: '',
      resultA: null,
      resultB: null,
    })
  )


  renderImage = (person, imageName) => {
    const src = imageName
      ? urljoin(urls.IMAGE_API_URL, person, imageName)
      : smilingFace;

    const altText = imageName || "Select image";

    return (
      <div className="image">
        <figure>
          <img
            src={src}
            alt={altText}
            width={100}
            height={100}
            onClick={() => this.openModal(person)}
          />
          <figcaption>{altText}</figcaption>
        </figure>
      </div>
    )
  }

  render() {
    const { imageA, imageB, resultA, resultB, isModalOpen, modalPerson } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          Swap Trump and Cage faces
        </header>

        <div className="App-main">
          {this.renderImage('trump', imageA)}

          <div className="plus-sign">
            <img src={plusSign} width={40}/>
          </div>

          {this.renderImage('cage', imageB)}

          <div className="equal-sign">
            <img src={equalSign} width={40}/>
          </div>

          {resultA && resultB && imageB && <div className="image">
            <figure>
              <img
                src={urljoin(urls.IMAGE_API_URL, 'swaps', resultB)}
                alt="Swapped Trump"
                width={200}
                height={200}
              />
              <figcaption>{"Swapped Trump"}</figcaption>
            </figure>
            <figure>
              <img
                src={urljoin(urls.IMAGE_API_URL, 'swaps', resultA)}
                alt="Swapped Cage"
                width={200}
                height={200}
              />
              <figcaption>{"Swapped Cage"}</figcaption>
            </figure>

          </div>}

        </div>

        <Modal
          isOpen={isModalOpen}
          onRequestClose={this.closeModal}
          style={modelStyles}
          contentLabel="Example Modal"
        >
          <ImageSelector
            person={modalPerson}
            onSelectImage={this.onSelectImage}
          />
        </Modal>

      </div>
    )
  }
}


export default App;
