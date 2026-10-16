import { renderPhotoChallenge } from './photo-challenge.js';

export default function familiar(context) {
  renderPhotoChallenge(context, {
    number: 5,
    ornament: '🐦 📸',
    instructions: 'The wizard has lost his familiar! Take a selfie with any bird. A chicken, duck, or any other bird will do! He needs proof that you have found it before he will release the familiar charm.',
  });
}
