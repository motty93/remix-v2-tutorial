import { json, LoaderFunction, LoaderFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import type { FunctionComponent } from 'react'

import { type ContactRecord, getContact } from '../data'
import invariant from 'tiny-invariant'

export const loader: LoaderFunction = async ({ params }: LoaderFunctionArgs ) => {
  invariant(params.contactId, 'missing contactId param')
	const contact = await getContact(String(params.contactId))
  if (!contact) {
    throw new Response("Not found contact", { status: 404 })
  }

	return json({ contact })
}

export default function Contact() {
	const { contact } = useLoaderData<typeof loader>()

	return contact ? (
		<div id='contact'>
			<div>
				<img
					alt={`${contact.first} ${contact.last} avatar`}
					key={contact.avatar}
					src={contact.avatar}
				/>
			</div>

			<div>
				<h1>
					{contact.first || contact.last ? (
						<>
							{contact.first} {contact.last}
						</>
					) : (
						<i>No Name</i>
					)}{' '}
					<Favorite contact={contact} />
				</h1>

				{contact.twitter && (
					<p>
						<a href={`https://twitter.com/${contact.twitter}`}>
							{contact.twitter}
						</a>
					</p>
				)}

				{contact.notes && <p>{contact.notes}</p>}

				<div>
					<Form action='edit'>
						<button type='submit'>Edit</button>
					</Form>

					<Form
						action='destroy'
						method='post'
						onSubmit={(event) => {
							const response = confirm(
								'Please confirm you want to delete this record.',
							)
							if (!response) {
								event.preventDefault()
							}
						}}
					>
						<button type='submit'>Delete</button>
					</Form>
				</div>
			</div>
		</div>
	) : (
		<></>
	)
}

const Favorite: FunctionComponent<{
	contact: Pick<ContactRecord, 'favorite'>
}> = ({ contact }) => {
	const favorite = contact.favorite

	return (
		<Form method='post'>
			<button
				aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
				name='favorite'
				value={favorite ? 'false' : 'true'}
			>
				{favorite ? '★' : '☆'}
			</button>
		</Form>
	)
}
