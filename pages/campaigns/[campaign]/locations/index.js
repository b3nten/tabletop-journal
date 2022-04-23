import { useState, useRef } from 'react'
import { AuthCheck } from '../../../../components/AuthGuard'
import { Navigation, AddButton } from '../../../../components/Navigation'
import supabase from '../../../../lib/supabase'
import Loader from '../../../../components/Loader/Loader'
import { useCampaignID, useDocumentList } from '../../../../lib/database'
import { Modal, Title } from '../../../../components/Modal'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { useSession } from '../../../../lib/authentication'


export default function LocationsPage() {
    const [newDocumentModalOpen, setNewDocumentModalOpen] = useState(false)

    return (
        <div>
            {newDocumentModalOpen && <Modal hide={setNewDocumentModalOpen}><CreateDocumentModal /></Modal>}
            <Navigation title='Locations'>
                <AddButton onClick={() => setNewDocumentModalOpen(true)} />
            </Navigation>
            <AuthCheck>
                <DocumentList />
            </AuthCheck>
        </div>
    )
}

function DocumentList() {
    const [newDocumentModalOpen, setNewDocumentModalOpen] = useState(false)
    const locations = useDocumentList('locations')

    return (<>

        {newDocumentModalOpen && <Modal hide={setNewDocumentModalOpen}><CreateDocumentModal /></Modal>}

        <div className=''>
            <div>
                <div className='mb-10'>
                    <h2 className='font-fancy text-6xl'>Locations</h2>
                </div>
                {locations.loaded ? locations.list.length > 0 ?
                    locations.list.map((doc) =>
                        <DocumentListItem
                            name={doc.name}
                            key={doc.location_id}
                            id={doc.location_id}
                            dimension={doc.dimension}
                            world={doc.world}
                            continent={doc.continent}
                            >
                        </DocumentListItem>)
                    : <div className='font-handwriting opacity-80 pl-1'>no locations</div>
                    : <Loader />
                }
                {locations.loaded && <button onClick={() => setNewDocumentModalOpen(true)} className='btn-underline mt-10'>Add Location</button>}
            </div>
        </div>
    </>)
}

function DocumentListItem(props) {
    const router = useRouter()
    const campaign = useCampaignID()
    return (
        <div onClick={() => router.push(`/campaigns/${campaign}/locations/${props.id}`)} className='flex flex-col items-start mt-8 space-y-1 cursor-pointer hover:scale-[1.02] transition-all'>
            <div className='text-3xl font-handwriting'>{props.name}</div>
            {props.dimension || props.world || props.continent ?
                        <div className='flex space-x-1 text-lg font-handwriting'>
                            <div>
                                {props.dimension && props.dimension + ', '}
                            </div>
                            <div>
                                {props.world && props.world + ', '}
                            </div>
                            <div>
                                {props.continent}
                            </div>
                        </div> : null}
            <img className='w-full h-1 opacity-20' src='/bottom_line.svg' />
        </div>
    )
}

function CreateDocumentModal(props) {
    const name = useRef()
    const campaign_id = useCampaignID()
    const router = useRouter()

    async function createDocument(e) {
        e.preventDefault()
        const parsedName = name.current.value === '' ? 'Cintra' : name.current.value
        let { data, error } = await supabase
            .from('locations')
            .insert({ name: parsedName, campaign_id: campaign_id })
            .single()
        if (error) {
            toast.error(error.message)
        } else {
            props.hide()
            router.push(`/campaigns/${campaign_id}/locations/${data.location_id}`)
        }
    }

    return (
        <div>
            <Title title='Add Location'></Title>
            <div className="flex flex-col space-y-4">
                <div>
                    <lable htmlFor='name' className='font-handwriting text-lg'>Name: </lable>
                    <input name='name' placeholder='Cintra' ref={name}></input>
                </div>
                <button className='btn-xs' onClick={createDocument}>Create Location</button>
            </div>
        </div>
    )
}