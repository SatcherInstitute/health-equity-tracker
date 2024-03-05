import CloseIcon from '@mui/icons-material/Close';
import { Button, Dialog, DialogContent } from '@mui/material';
import { useAtomValue } from 'jotai';
import { HashLink } from 'react-router-hash-link';
import { type DropdownVarId } from '../../data/config/MetricConfig';
import { getParentDropdownFromDataTypeId } from '../../utils/MadLibs';
import { useParamState } from '../../utils/hooks/useParamState';
import {
	DATA_CATALOG_PAGE_LINK,
	OLD_METHODOLOGY_PAGE_LINK,
} from '../../utils/internalRoutes';
import { selectedDataTypeConfig1Atom } from '../../utils/sharedSettingsState';
import { TOPIC_INFO_PARAM_KEY } from '../../utils/urlutils';
import DataTypeDefinitionsList from '../ui/DataTypeDefinitionsList';

export default function TopicInfoModal() {
	const [topicInfoModalIsOpen, setTopicInfoModalIsOpen] =
		useParamState(TOPIC_INFO_PARAM_KEY);

	const selectedDataTypeId = useAtomValue(
		selectedDataTypeConfig1Atom,
	)?.dataTypeId;

	const dropdownVarId: DropdownVarId | '' = selectedDataTypeId
		? getParentDropdownFromDataTypeId(selectedDataTypeId)
		: '';

	return (
		<Dialog
			open={Boolean(topicInfoModalIsOpen)}
			onClose={() => {
				setTopicInfoModalIsOpen(false);
			}}
			maxWidth={'lg'}
			scroll='paper'
		>
			<DialogContent dividers={true}>
				<Button
					sx={{ float: 'right' }}
					onClick={() => {
						setTopicInfoModalIsOpen(false);
					}}
					color='primary'
					aria-label='close topic info modal'
				>
					<CloseIcon />
				</Button>
				<DataTypeDefinitionsList />
			</DialogContent>
			<DialogContent dividers={true} className='text-smallest'>
				For specific calculations and more detailed information, visit our{' '}
				<HashLink
					to={`${OLD_METHODOLOGY_PAGE_LINK as string}#${dropdownVarId}`}
				>
					methodology
				</HashLink>
				, or view the{' '}
				<HashLink to={DATA_CATALOG_PAGE_LINK}>source data</HashLink>.
			</DialogContent>
		</Dialog>
	);
}
