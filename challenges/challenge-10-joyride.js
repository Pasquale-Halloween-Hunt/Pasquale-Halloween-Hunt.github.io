import { renderPhotoChallenge } from './photo-challenge.js';

export default function joyride(context) {
  renderPhotoChallenge(context, {
    number: 10,
    ornament: '💀 🚜',
    instructions: 'Find the Halloween skeleton sitting on a tractor and take a photo posing with it. The skeleton is guarding the joyride charm and will only hand it over once you prove you joined the ride.',
  });
}
