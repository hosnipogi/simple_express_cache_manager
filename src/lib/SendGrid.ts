import type { ClientRequest } from "@sendgrid/client/src/request";
import sgMail, { type MailDataRequired } from "@sendgrid/mail";
import client from "@sendgrid/client";

export async function addToSendgridMailingList(
  contacts: { email: string; custom_fields?: Record<string, unknown> }[],
  list_ids = [process.env.SENDGRID_LIST_ID]
) {
  client.setApiKey(process.env.SENDGRID_API_KEY!);

  const body = { contacts, list_ids };
  const request: ClientRequest = {
    url: `/v3/marketing/contacts`,
    method: "PUT",
    body,
  };

  const response = await client.request(request);
  return response;
}

export async function sendMail(data: MailDataRequired) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  await sgMail.send(data);
  return true;
}
