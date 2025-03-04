import type { ILivechatTrigger } from '@rocket.chat/core-typings';
import { IconButton } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSetModal, useToastMessageDispatch, useRoute, useTranslation, useEndpoint } from '@rocket.chat/ui-contexts';
import { memo } from 'react';

import GenericModal from '../../../components/GenericModal';
import { GenericTableCell, GenericTableRow } from '../../../components/GenericTable';

type TriggersRowProps = Pick<ILivechatTrigger, '_id' | 'name' | 'description' | 'enabled'> & { reload: () => void };

const TriggersRow = ({ _id, name, description, enabled, reload }: TriggersRowProps) => {
	const t = useTranslation();
	const setModal = useSetModal();
	const triggersRoute = useRoute('omnichannel-triggers');
	const deleteTrigger = useEndpoint('DELETE', '/v1/livechat/triggers/:_id', { _id });
	const dispatchToastMessage = useToastMessageDispatch();

	const handleClick = useMutableCallback(() => {
		triggersRoute.push({
			context: 'edit',
			id: _id,
		});
	});

	const handleKeyDown = useMutableCallback((e) => {
		if (!['Enter', 'Space'].includes(e.nativeEvent.code)) {
			return;
		}

		handleClick();
	});

	const handleDelete = useMutableCallback((e) => {
		e.stopPropagation();
		const onDeleteTrigger = async () => {
			try {
				await deleteTrigger();
				dispatchToastMessage({ type: 'success', message: t('Trigger_removed') });
				reload();
			} catch (error) {
				dispatchToastMessage({ type: 'error', message: error });
			}
			setModal();
		};

		setModal(<GenericModal variant='danger' onConfirm={onDeleteTrigger} onCancel={() => setModal()} confirmText={t('Delete')} />);
	});

	return (
		<GenericTableRow key={_id} role='link' action tabIndex={0} onClick={handleClick} onKeyDown={handleKeyDown}>
			<GenericTableCell withTruncatedText>{name}</GenericTableCell>
			<GenericTableCell withTruncatedText>{description}</GenericTableCell>
			<GenericTableCell withTruncatedText>{enabled ? t('Yes') : t('No')}</GenericTableCell>
			<GenericTableCell withTruncatedText>
				<IconButton icon='trash' small title={t('Remove')} onClick={handleDelete} />
			</GenericTableCell>
		</GenericTableRow>
	);
};

export default memo(TriggersRow);
