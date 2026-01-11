import { NextResponse } from 'next/server';
import { getAllPersons, getAllAttributes, getPersonAttributes } from '@/lib/db';

export async function GET() {
  try {
    // 全人物を取得
    const persons = await getAllPersons();

    // 全属性を取得
    const attributes = await getAllAttributes();

    // 全人物の属性データを取得
    const personAttributes: Array<{ person_id: number; attribute_id: number; value: boolean }> = [];

    for (const person of persons) {
      const attrs = await getPersonAttributes(person.id);
      attrs.forEach(attr => {
        personAttributes.push({
          person_id: attr.person_id,
          attribute_id: attr.attribute_id,
          value: attr.value,
        });
      });
    }

    return NextResponse.json({
      persons,
      attributes,
      personAttributes,
    });
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
