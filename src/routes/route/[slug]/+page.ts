/** @type {import('./$types').PageLoad} */

export const prerender = false;

export function load({ params }: { params: any }) {
  return {
    id: params.slug,
  };
}