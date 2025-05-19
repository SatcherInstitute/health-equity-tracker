import { USA_DISPLAY_NAME, USA_FIPS } from '../utils/ConstantsGeography'

interface FipsSpec {
  code: string
  name: string
}
export const CHATAM: FipsSpec = {
  code: '37037',
  name: 'Chatam County',
}

export const NC: FipsSpec = {
  code: '37',
  name: 'North Carolina',
}

export const VI: FipsSpec = {
  code: '78',
  name: 'U.S. Virgin Islands',
}
export const USA: FipsSpec = {
  code: USA_FIPS,
  name: USA_DISPLAY_NAME,
}
